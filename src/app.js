'use strict';
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const app = express();

const usersRouter = require('./users/users_router');
const adoptions = require('./adoptions/adoptions_router');

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(helmet());


// whitelist allowed origins
const allowedOrigins = ['http://localhost:3000', 'https://petful.verdi327.now.sh', 'https://petful.verdi327.now.sh/'];
app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin - like mobile apps, curl, postman
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = 'The CORS policy for this site does not ' +
                  'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.use('/api/users', usersRouter);
app.use('/api/adoptions', adoptions);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use(errorHandler);

function errorHandler(error, req, res, next) {
  const code = error.status || 500;

  if (NODE_ENV === 'production') {
    error.message = code === 500 ? 'internal server error' : error.message;
  } else {
    console.error(error);
  }

  res.status(code).json({ message: error.message });
}

module.exports = app;