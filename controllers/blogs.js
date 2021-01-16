const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({});
  response.json(blogs);
});

blogsRouter.post('/', async (request, response) => {
  const { body } = request;

  const blog = new Blog({
    title: body.title,
    author: body.author || '',
    url: body.url,
    likes: body.likes || 0,
  });

  const result = await blog.save();
  response.status(201).json(result);
});

blogsRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndRemove(request.params.id);
  response.status(204).end();
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

  response.json(updatedBlog);
});

module.exports = blogsRouter;
