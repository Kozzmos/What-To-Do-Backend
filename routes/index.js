const express = require('express');
const router = require('express').Router();
const cors = require('cors');

const listsRouter = require('./lists');
const todosRouter = require('./todos');

router.use(cors());
router.use(express.json());

router.use('/api/lists', listsRouter);
router.use('/api/todos', todosRouter);

router.get('/', (req, res) => {
  res.send('Welcome to the API root.');
});

module.exports = router;