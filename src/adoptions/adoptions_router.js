'use strict';

const qs = require('querystring');
const moment = require('moment');
const express = require('express');
const adoptionsRouter = express.Router();
const bodyParser = express.json();
const UserQueue = require('../users/user_queue');
const DogQueue = require('./dog_queue');
const CatQueue = require('./cat_queue');
const axios = require('axios');
const utils = require('../utils');

const authToken = {
  token: '',
  expiresAt: moment()
};

function buildAnimalObj(res) {
  return {
    gender: res.gender,
    size: res.size,
    name: res.name,
    description: res.description,
    photo: res.photos[0].large
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
    const zipcode = req.params.zipcode || '95677';
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
      if (dogObj.photos.length) {
        return buildAnimalObj(dogObj);
      }
    });
    const cats = catData.data.animals.map(catObj => {
      if (catObj.photos.length) {
        return buildAnimalObj(catObj);
      }
    });

    dogs.forEach(dog => DogQueue.enqueue(dog));
    cats.forEach(cat => CatQueue.enqueue(cat));
    res.json({dog: utils.peek(DogQueue), cat: utils.peek(CatQueue)});
  });


  


module.exports = adoptionsRouter;