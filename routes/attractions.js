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

/*
Day.belongsTo(Hotel);
Day.belongsToMany(Restaurant, {through: 'day_restaurant'});
Day.belongsToMany(Activity, {through: 'day_activity'});
 */

//GET ALL DAYS
router.get('/days', function(req, res, next){
  Day.findAll({
    include: [Hotel, Restaurant, Activity],
    order: [['number', 'ASC']]
  })
    .then((allDays) => {
      res.send(allDays)
    })
})

//CREATE A DAY
router.post('/days', function(req, res, next){
  Day.create(req.body)
    .then((day) => {
      res.send(day);
    })
})

//DELETE A DAY
router.delete('/days/:id', function(req, res, next){
  Day.destroy({
    where: {
      number: req.params.id
    }
  })
  .then(() => {
    res.send('destroyed day!')
  })
})

//CREATE AN ATTRACTION
router.post('/days/:id/:type', function(req, res, next){
  var findingDay = Day.findOne({ where: { number: req.params.id } });
  var findingAttraction;

  if (req.params.type === "restaurant"){
    var findingAttraction = Restaurant.findOne({
      where: { id: req.body.id }
    });

    Promise.all([findingDay, findingAttraction])
      .then(([foundDay, foundRest]) => {
        res.send(foundDay.addRestaurant(foundRest));
      })
  }

  else if (req.params.type === "activity"){
    var findingAttraction = Activity.findOne({
      where: { id: req.body.id }
    });

    Promise.all([findingDay, findingAttraction])
      .then(([foundDay, foundActivity]) => {
        res.send(foundDay.addActivity(foundActivity));
      })
  }

  else if (req.params.type === "hotel"){
    var findingAttraction = Hotel.findOne({
      where: { id: req.body.id }
    });

    Promise.all([findingDay, findingAttraction])
      .then(([foundDay, foundHotel]) => {
        res.send(foundDay.setHotel(foundHotel));
      })
  }
})

//DELETE AN ATTRACTION
router.delete('/days/:id/:type', function(req, res, next){
  var findingDay = Day.findOne({ where: { number: req.params.id } });
  var findingAttraction;

  if (req.params.type === "restaurant"){
    var findingAttraction = Restaurant.findOne({
      where: { id: req.body.id }
    });

    Promise.all([findingDay, findingAttraction])
      .then(([foundDay, foundRest]) => {
        res.send(foundDay.removeRestaurant(foundRest));
      })
  }

  else if (req.params.type === "activity"){
    var findingAttraction = Activity.findOne({
      where: { id: req.body.id }
    });

    Promise.all([findingDay, findingAttraction])
      .then(([foundDay, foundActivity]) => {
        res.send(foundDay.removeActivity(foundActivity));
      })
  }

  else if (req.params.type === "hotel"){
    findingDay
      .then((day) => {
        res.send(day.setHotel(null));
      })
  }
})



module.exports = router;
