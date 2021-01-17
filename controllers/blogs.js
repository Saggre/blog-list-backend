const jwt = require('jsonwebtoken');
const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');
const { SECRET } = require('../utils/config');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });
  return response.json(blogs);
});

blogsRouter.post('/', async (request, response) => {
  const { body } = request;

  const decodedToken = jwt.verify(request.token, SECRET);

  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' });
  }

  const user = await User.findById(decodedToken.id);

  if (!user) {
    return response.status(401).json({ error: 'user not authenticated with token' });
  }

  const blog = new Blog({
    title: body.title,
    author: body.author || '',
    url: body.url,
    likes: body.likes || 0,
    user: user._id,
  });

  const result = await blog.save();
  user.blogs = user.blogs.concat(blog._id);
  await user.save();

  return response.status(201).json(result);
});

blogsRouter.delete('/:id', async (request, response) => {
  const decodedToken = jwt.verify(request.token, SECRET);

  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' });
  }

  const result = await Blog.findOneAndDelete({
    _id: request.params.id,
    user: { _id: decodedToken.id },
  });

  if (!result) {
    return response.status(404).end();
  }

  return response.status(204).end();
});

blogsRouter.put('/:id', async (request, response) => {
  const { body } = request;

  const blog = {
    ...('title' in body) && { title: body.title },
    ...('author' in body) && { author: body.author },
    ...('url' in body) && { url: body.url },
    ...('likes' in body) && { likes: body.likes },
  };

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {
    new: true,
    runValidators: true,
    context: 'query',
  });

  return response.json(updatedBlog);
});

module.exports = blogsRouter;
