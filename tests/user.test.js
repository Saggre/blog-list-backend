const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const User = require('../models/user');
const helper = require('../utils/list_helper');
const { addTestUser } = require('../utils/list_helper');

const api = supertest(app);

const users = [
  {
    username: 'root', name: 'Foo Bar', password: 'hunter2',
  },
  {
    username: 'username', name: 'Bar Foo', password: '123456',
  },
];

describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    const promises = users.map((user) => addTestUser(user));
    await Promise.all(promises);
  });

  test('creation fails with proper status code and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb();

    const result = await api
      .post('/api/users')
      .send({
        username: 'root',
        name: 'Superuser',
        password: 'salainen',
      })
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body).toHaveProperty('error');

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });

  test('creation fails properly when username or password is too short', async () => {
    const usersAtStart = await helper.usersInDb();

    let result = await api
      .post('/api/users')
      .send({
        username: 'ab',
        name: 'Shortusername',
        password: 'shortusername',
      })
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body).toHaveProperty('error');

    result = await api
      .post('/api/users')
      .send({
        username: 'shortpassword',
        name: 'Shortpassword',
        password: 'ab',
      })
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body).toHaveProperty('error');

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
