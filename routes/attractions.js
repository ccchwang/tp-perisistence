var express = require('express');
var router = express.Router();
var Promise = require('bluebird');
var db = require('../models/_db');
var Place = require('../models/place')
var Hotel = require('../models/hotel');
var Restaurant = require('../models/restaurant');
var Activity = require('../models/activity');
var Day = require('../models/day');

router.get('/', function(req, res, next) {
  var allHotels = Hotel.findAll();
  var allRestaurants = Restaurant.findAll();
  var allActivities = Activity.findAll();

  Promise.all([allHotels, allRestaurants, allActivities])
    .then((allThings) =>{
      res.json(allThings)
    })
})

router.get('/hotels', function(req, res, next){
})

router.get('/restaurants', function(req, res, next){
  Restaurant.findAll()
  .then((allRestaurants) => {
    res.send(allRestaurants)
  })
})

router.get('/activities', function(req, res, next){

})

router.get('/days', function(req, res, next){
  Day.findAll()
    .then((allDays) => {
      res.send(allDays)
    })
})

router.get('/days/:id', function(req, res, next){

})

router.delete('/days/:id', function(req, res, next){

})

router.post('/days', function(req, res, next){
  //console.log("req!", req.body.num);
  Day.create(req.body)
    .then((day) => {
      
      res.send(day);
    })
})



router.post('/days/:id/:type', function(req, res, next){

})



module.exports = router;
