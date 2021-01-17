const _ = require('lodash');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const { SECRET } = require('./config');

// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => 1;

/**
 * Get the total number of likes across all blogs
 * @param blogs
 */
const totalLikes = (blogs) => _.reduce(blogs, (r, v) => r + v.likes, 0);

/**
 * Get the most liked post
 * @param blogs
 * @returns {*}
 */
const favoriteBlog = (blogs) => _.reduce(blogs, (r, v) => (r.likes > v.likes ? r : v));

/**
 * Get author with the most blog posts
 * @param blogs
 * @returns {unknown}
 */
const mostBlogs = (blogs) => {
  let authors = _.groupBy(blogs, 'author');
  authors = _.map(authors, (v, k) => ({
    author: k,
    blogs: v.length,
  }));
  return _.reduce(authors, (r, v) => (r.blogs > v.blogs ? r : v));
};

/**
 * Get author with the most total likes
 * @param blogs
 * @returns {unknown}
 */
const mostLikes = (blogs) => {
  let authors = _.groupBy(blogs, 'author');
  authors = _.map(authors, (v, k) => ({
    author: k,
    likes: totalLikes(v),
  }));
  return _.reduce(authors, (r, v) => (r.likes > v.likes ? r : v));
};

/**
 * Return a list of users in db
 * @returns {Promise<*>}
 */
const usersInDb = async () => {
  const users = await User.find({});
  return users.map((u) => u.toJSON());
};

/**
 * Fetches a bearer token for a user
 * @param user
 * @returns {Promise<string|Token.value|Object.value>}
 */
const addTestUser = async (user) => {
  const newUser = { ...user, passwordHash: await bcrypt.hash(user.password, 10) };
  delete newUser.password;
  const dbUser = await new User(user).save();

  const token = jwt.sign({
    username: dbUser.username,
    id: dbUser._id,
  }, SECRET);

  return {
    token,
    id: dbUser._id,
  };
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
  usersInDb,
  addTestUser,
};
