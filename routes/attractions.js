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


router.get('/restaurants', function(req, res, next){
  Restaurant.findAll()
  .then((allRestaurants) => {
    res.send(allRestaurants)
  })
})

router.get('/activities', function(req, res, next){

})

router.get('/days', function(req, res, next){
  Day.findAll({include: [Hotel, Restaurant, Activity]})
    .then((allDays) => {
      res.send(allDays)
    })
})

router.delete('/days/:id', function(req, res, next){

  var id = req.params.id;

  Day.destroy({
    where: {
      number: id
    }
  })
    .then(() => {
      res.send('destroyed day!')
    })
})

router.post('/days/:id', function(req, res, next){
  var number = req.params.id;
  var hotelId = req.body.hotelId;

  var findingDay = Day.findOne({
      where: {
        number: number
      }
    })

  var findingHotel = Hotel.findOne({
    where: {
      id: hotelId
    }
  })

  Promise.all([findingDay, findingHotel])
    .then(([foundDay, foundHotel]) => {
      return foundDay.setHotel(foundHotel);
    })
    .then((day) => {
      res.send(day)
    })
})

router.delete('/days', function(req, res, next){
  Day.destroy({
    where: {}
  })
    .then(function(){
      res.send('deleted all days!')
    })
})

router.post('/days', function(req, res, next){
  var number = req.body.number
  Day.create({
    number: number
  })
    .then((day) => {
      console.log('created day', day)
      res.send(day);
    })
})



router.post('/days/:id/:type', function(req, res, next){
  
  if (req.params.type === "restaurant"){

  var dayNumber = req.params.id;
  var restaurantId = req.body.restaurantId;

  var findingDay = Day.findOne({
    where: {
      number: dayNumber
    }
  });
  //console.log(findingDay);

  var findingRestaurant = Restaurant.findOne({
    where: {
      id: restaurantId
    }
  });
  //console.log(findingRestaurant);

  Promise.all([findingDay, findingRestaurant])
      .then(function([foundDay, foundRestaurant]){
         console.log(foundDay, foundRestaurant);

          return foundDay.addRestaurant(foundRestaurant);
 })
}
else if (req.params.type === "activity"){
  var dayNumber = req.params.id;
  var activityId = req.body.activityId;

  var findingDay = Day.findOne({
    where: {
      number: dayNumber
    }
  });
  //console.log(findingDay);

  var findingActivity = Activity.findOne({
    where: {
      id: activityId
    }
  });
  //console.log(findingRestaurant);

  Promise.all([findingDay, findingActivity])
      .then(function([foundDay, foundActivity]){
         console.log(foundDay, foundActivity);

          return foundDay.addActivity(foundActivity);
 })
}
})



module.exports = router;
