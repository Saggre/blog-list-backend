const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');

const api = supertest(app);
const Blog = require('../models/blog');

const blogs = [{
  _id: '5a422a851b54a676234d17f7', title: 'React patterns', author: 'Michael Chan', url: 'https://reactpatterns.com/', likes: 7, __v: 0,
},
{
  _id: '5a422aa71b54a676234d17f8', title: 'Go To Statement Considered Harmful', author: 'Edsger W. Dijkstra', url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html', likes: 5, __v: 0,
},
];

beforeEach(async () => {
  await Blog.deleteMany({});
  await blogs.forEach((b) => new Blog(b).save());
});

describe('API tests', () => {
  test('Blog list application returns the correct amount of blog posts in JSON format', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body).toHaveLength(blogs.length);
  });

  test('Blogs contain correct id parameter', async () => {
    const response = await api.get('/api/blogs');

    response.body.forEach((blog) => {
      expect(blog.id).toBeDefined();
    });
  });

  test('Blog is posted correctly', async () => {
    await api
      .post('/api/blogs')
      .send(blogs[0])
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const response = await api.get('/api/blogs');
    const titles = response.body.map((r) => r.title);

    expect(response.body).toHaveLength(blogs.length + 1);
    expect(titles).toContain(blogs[0].title);
  });

  test('Like count defaults to zero', async () => {
    const blog = blogs[0];
    delete blog.likes;

    const response = await api.post('/api/blogs').send(blog);

    expect(response.body.likes).toEqual(0);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
