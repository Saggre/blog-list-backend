const express = require('express');
const mongoose = require('mongoose');
require('express-async-errors');
const cors = require('cors');
const blogsRouter = require('./controllers/blogs');
const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');
const testsRouter = require('./controllers/tests');
const config = require('./utils/config');
const logger = require('./utils/logger');
const middleware = require('./utils/middleware');

logger.info('connecting to', config.MONGODB_URI);

mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true,
})
  .then(() => {
    logger.info('connected to MongoDB');
  })
  .catch((error) => {
    logger.info('error connecting to MongoDB:', error.message);
  });

const app = express();

app.use(cors());
app.use(express.static('build'));
app.use(express.json());

app.use(middleware.tokenExtractor);

app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);
app.use('/api/blogs', blogsRouter);

if (process.env.NODE_ENV === 'test') {
  app.use('/api/testing', testsRouter);
}

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
