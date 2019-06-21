'use strict';

const express = require('express');
const adoptionsRouter = express.Router();
const bodyParser = express.json();
const UserQueue = require('../users/user_queue');
const DogQueue = require('./dog_queue');
const CatQueue = require('./cat_queue');
const axios = require('axios').create({
  baseURL: process.env.PETFINDER_API_URL,
  headers: {'Authorization': `Bearer ${process.env.PETFINDER_API_TOKEN}`}
});
const utils = require('../utils');


function buildAnimalObj(res) {
  return {
    gender: res.gender,
    size: res.size,
    name: res.name,
    description: res.description,
    photo: res.photos[0].large
  };
}


adoptionsRouter
  .route('/')
  .get(async (req, res, next) => {
    const zipcode = req.params.zipcode || '95677';

    const dogData = await axios.get(`/animals?type=dog&location=${zipcode}`);
    const catData = await axios.get(`/animals?type=cat&location=${zipcode}`);
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
    
    // make request to dog api - clean the response
    // make request to cat api
    // 
  });
  


module.exports = adoptionsRouter;