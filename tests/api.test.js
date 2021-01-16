const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');

const api = supertest(app);
const Blog = require('../models/blog');

const blogs = [
  {
    title: 'React patterns', author: 'Michael Chan', url: 'https://reactpatterns.com/', likes: 7,
  },
  {
    title: 'Go To Statement Considered Harmful', author: 'Edsger W. Dijkstra', url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html', likes: 5,
  },
];

describe('when there is initially some blogs saved', () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
    const blogPromises = blogs.map((blog) => new Blog(blog).save());
    await Promise.all(blogPromises);
  });

  test('blog list application returns the correct amount of blog posts in JSON format', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body).toHaveLength(blogs.length);
  });

  test('blog is posted correctly', async () => {
    await api
      .post('/api/blogs')
      .send({ ...blogs[0] })
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const response = await api.get('/api/blogs');
    const titles = response.body.map((r) => r.title);

    expect(response.body).toHaveLength(blogs.length + 1);
    expect(titles).toContain(blogs[0].title);
  });

  test('blogs contain correct id parameter', async () => {
    const response = await api.get('/api/blogs');

    response.body.forEach((blog) => {
      expect(blog.id).toBeDefined();
    });
  });

  test('a blog can be modified', async () => {
    let response = await api.get('/api/blogs');
    const newTitle = 'New blog title';
    const newLikes = 1337;
    const { id } = response.body[0];

    await api.put(`/api/blogs/${id}`).send({
      title: newTitle,
      likes: newLikes,
    }).expect(200);

    response = await api.get('/api/blogs');
    const titles = response.body.map((r) => r.title);
    const likes = response.body.map((r) => r.likes);

    expect(titles).toContain(newTitle);
    expect(likes).toContain(newLikes);
  });

  test('a blog can be deleted by id', async () => {
    let response = await api.get('/api/blogs');
    const { id } = response.body[0];
    await api.delete(`/api/blogs/${id}`).expect(204);

    response = await api.get('/api/blogs');
    expect(response.body).toHaveLength(blogs.length - 1);
  });
});

describe('addition of a new blog', () => {
  test('like count defaults to zero', async () => {
    const blog = { ...blogs[0] };
    delete blog.likes;

    const response = await api.post('/api/blogs').send(blog);
    expect(response.body.likes).toEqual(0);
  });

  test('blog title and url are required properties', async () => {
    let blog = { ...blogs[0] };
    delete blog.title;

    await api.post('/api/blogs').send(blog).expect(400);

    blog = { ...blogs[0] };
    delete blog.url;

    await api.post('/api/blogs').send(blog).expect(400);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
