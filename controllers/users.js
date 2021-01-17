const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');

usersRouter.post('/', async (request, response, next) => {
  const { body } = request;

  if (body.password.length < 3) {
    const err = new Error('Password length must be at least 3');
    err.name = 'ValidationError';
    return next(err);
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(body.password, saltRounds);

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash,
  });

  const savedUser = await user.save();

  response.json(savedUser);
});

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', {
    title: 1, author: 1, url: 1, likes: 1,
  });
  response.json(users.map((u) => u.toJSON()));
});

module.exports = usersRouter;
