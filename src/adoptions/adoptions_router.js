'use strict';

const qs = require('querystring');
const moment = require('moment');
const express = require('express');
const adoptionsRouter = express.Router();
const UserQueue = require('../users/user_queue');
const DogQueue = require('./dog_queue');
const CatQueue = require('./cat_queue');
const axios = require('axios');
const utils = require('../utils');

const authToken = {
  token: '',
  expiresAt: moment()
};

function buildAnimalObj(res, type) {
  let photo;
  let description;
  if (res.photos.length) {
    photo = res.photos[0].large;
    description = res.description;
  } else {
    if (type === 'cat') {
      photo = 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80';
      description = 'Oh no! My shelter was too lazy to upload a description about me';
    } else {
      photo = 'https://s3.amazonaws.com/cdn-origin-etr.akc.org/wp-content/uploads/2017/11/13002253/GettyImages-521536928-_1_.jpg';
      description = 'Oh no! My shelter was too lazy to upload a description about me';
    }
  }
  
  return {
    gender: res.gender,
    size: res.size,
    name: res.name,
    description,
    photo
  };
}

async function getAuthToken(req, res, next) {
  const currentTime = moment();

  if (currentTime < authToken.expiresAt) {
    req.authToken = authToken;
    return next();
  }

  const data = {
    'grant_type': 'client_credentials',
    'client_id': process.env.PETFINDER_CLIENT_ID,
    'client_secret': process.env.PETFINDER_CLIENT_SECRET
  };

  const options = {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: qs.stringify(data),
    url: 'https://api.petfinder.com/v2/oauth2/token',
  };
  
  const response = await axios(options);
  authToken.expiresAt = moment().add(response.data.expires_in, 's');
  authToken.token = response.data.access_token;
  req.authToken = authToken;
  next();
}


adoptionsRouter
  .route('/')
  .get(getAuthToken, async (req, res, next) => {
    const zipcode = req.query.zipcode || '95677';
    const baseUrl = process.env.PETFINDER_API_URL;

    const dogRequest = axios.get(`${baseUrl}/animals?type=dog&location=${zipcode}`, {
      headers: {
        'Authorization': `Bearer ${req.authToken.token}`
      }
    });
    const catRequest = axios.get(`${baseUrl}/animals?type=cat&location=${zipcode}`, {
      headers: {
        'Authorization': `Bearer ${req.authToken.token}`
      }
    });

    const [dogData, catData] = await Promise.all([dogRequest, catRequest]);
    
    const dogs = dogData.data.animals.map(dogObj => {
      return buildAnimalObj(dogObj, 'dog');
    }).filter(Boolean);

    const cats = catData.data.animals.map(catObj => {
      return buildAnimalObj(catObj, 'cat');
    }).filter(Boolean);

    dogs.forEach(dog => DogQueue.enqueue(dog));
    cats.forEach(cat => CatQueue.enqueue(cat));
    res.json({dog: utils.peek(DogQueue), cat: utils.peek(CatQueue)});
  });

adoptionsRouter
  .route('/dog')
  .delete((req, res, next) => {
    const user = UserQueue.dequeue();
    const dog = DogQueue.dequeue();
    res.json({user, dog});
  })
  .get((req, res, next) => {
    res.json({dog: utils.peek(DogQueue)});
  });

adoptionsRouter
  .route('/cat')
  .delete((req, res, next) => {
    const user = UserQueue.dequeue();
    const cat = CatQueue.dequeue();
    res.json({user, cat});
  })
  .get((req, res, next) => {
    res.json({cat: utils.peek(CatQueue)});
  });

module.exports = adoptionsRouter;