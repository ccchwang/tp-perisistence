/* eslint-disable camelcase */
var Sequelize = require('sequelize');
var db = require('./_db');
var Place = require('./place');
var Restaurant = require('./restaurant');
var Activity = require('./activity');
var Hotel = require('./hotel');

var Day = db.define('day', {
  number: {
    type: Sequelize.INTEGER
  //  allowNull: false
  }
//}, //{
	// hooks: {
	// 	beforeValidate: function(number){
	// 		this.number += 1;
	// 	}
	// }
});

Day.belongsTo(Hotel);
Day.belongsToMany(Restaurant, {through: 'day_restaurant'});
Day.belongsToMany(Activity, {through: 'day_activity'});

module.exports = Day;
