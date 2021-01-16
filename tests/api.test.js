const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');

const api = supertest(app);
const Blog = require('../models/blog');

const initialBlogs = [
  {
    title: 'Title',
    author: 'Author Authorina',
    url: 'http://localhost:8080',
    likes: 10,
  },
  {
    title: 'Title',
    author: 'Author Authorina',
    url: 'http://localhost:8080',
    likes: 15,
  },
];

beforeEach(async () => {
  await Blog.deleteMany({});
  await initialBlogs.forEach((b) => new Blog(b).save());
});

test('Blog list application returns the correct amount of blog posts in JSON format', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);

  expect(response.body).toHaveLength(2);
});

afterAll(() => {
  mongoose.connection.close();
});
