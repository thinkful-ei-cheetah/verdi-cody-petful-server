'use strict';

const express = require('express');
const usersRouter = express.Router();
const bodyParser = express.json();
const UserQueue = require('./user_queue');

usersRouter
  .route('/')
  .post(bodyParser, (req, res, next) => {
    const {full_name, email} = req.body;
    const newUser = {full_name, email};

    UserQueue.enqueue(newUser);
    res.json({});
  })
  .get((req, res, next) => {
    const users = UserQueue.display();
    res.json(users);
  });


module.exports = usersRouter;