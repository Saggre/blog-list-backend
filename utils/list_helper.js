// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => 1;

/**
 * Get the total number of likes across all blogs
 * @param blogs
 */
const totalLikes = (blogs) => blogs.reduce((carry, blog) => carry + blog.likes, 0);

const favoriteBlog = (blogs) => blogs.reduce((carry, blog) => (carry.likes > blog.likes ? carry : blog));

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
};
