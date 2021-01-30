const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');

const api = supertest(app);
const Blog = require('../models/blog');
const User = require('../models/user');
const { addTestUser } = require('../utils/list_helper');

const blogs = [
  {
    title: 'React patterns', author: 'Michael Chan', url: 'https://reactpatterns.com/', likes: 7,
  },
  {
    title: 'Go To Statement Considered Harmful', author: 'Edsger W. Dijkstra', url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html', likes: 5,
  },
];

const user = { username: 'root', name: 'Foo Bar', password: 'hunter2' };

describe('when there is initially some blogs saved, and a user exists', () => {
  let testAuth;

  beforeEach(async () => {
    await User.deleteMany({});

    testAuth = await addTestUser(user);

    await Blog.deleteMany({});
    const blogPromises = blogs.map((blog) => new Blog({ ...blog, user: testAuth.id }).save());
    const blogIds = (await Promise.all(blogPromises)).map((blog) => blog._id);

    // Set blog ids to user
    await User.findByIdAndUpdate(testAuth.id, { blogs: blogIds }, {
      new: true,
      runValidators: true,
      context: 'query',
    });
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
      .set('Authorization', `bearer ${testAuth.token}`)
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
    await api.delete(`/api/blogs/${id}`).set('Authorization', `bearer ${testAuth.token}`).expect(204);

    response = await api.get('/api/blogs');
    expect(response.body).toHaveLength(blogs.length - 1);
  });
});

describe('when there is no authenticated user', () => {
  test('new blog cannot be added without authenticating', async () => {
    const blog = { ...blogs[0] };

    await api.post('/api/blogs').send(blog).expect(401);
  });
});

describe('addition of a new blog when a user exists', () => {
  let testAuth;

  beforeEach(async () => {
    await User.deleteMany({});

    testAuth = await addTestUser(user);
  });

  test('like count defaults to zero', async () => {
    const blog = { ...blogs[0] };
    delete blog.likes;

    const response = await api.post('/api/blogs').send(blog).set('Authorization', `bearer ${testAuth.token}`);
    expect(response.body.likes).toEqual(0);
  });

  test('blog title and url are required properties', async () => {
    let blog = { ...blogs[0] };
    delete blog.title;

    await api.post('/api/blogs').send(blog).set('Authorization', `bearer ${testAuth.token}`).expect(400);

    blog = { ...blogs[0] };
    delete blog.url;

    await api.post('/api/blogs').send(blog).set('Authorization', `bearer ${testAuth.token}`).expect(400);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
