'use strict';

const Queue = require('../queue');
const UserQueue = new Queue();

const fakeUsers = [
  {full_name: 'John Smith', email: 'john@smith.com'},
  {full_name: 'Jane Doe', email: 'jane@doe.com'},
  {full_name: 'Trudy McBryant', email: 'trudy@foo.com'},
  {full_name: 'Kevin Durant', email: 'kevin@durant.com'},
];

fakeUsers.forEach(user => UserQueue.enqueue(user));

module.exports = UserQueue;