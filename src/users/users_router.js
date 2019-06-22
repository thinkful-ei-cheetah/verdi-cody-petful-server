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

usersRouter
  .route('/refresh')
  .get((req, res, next) => {
    const fakeUsers = [
      {full_name: 'John Smith', email: 'john@smith.com'},
      {full_name: 'Jane Doe', email: 'jane@doe.com'},
      {full_name: 'Trudy McBryant', email: 'trudy@foo.com'},
      {full_name: 'Kevin Durant', email: 'kevin@durant.com'},
    ];
    
    fakeUsers.forEach(user => UserQueue.enqueue(user));
    const users = UserQueue.display();
    res.json(users);
  });


module.exports = usersRouter;