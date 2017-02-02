'use strict';
/* global $ tripModule attractionsModule hotels restaurants activities */

/**
 * This module fills the `select` tags with `option`s.
 * It runs immediately upon document ready (not called by other modules).
 * Each `option` displays the name of an attraction and is has a value of
 * that attraction's id. Selecting an option looks up the attraction by id,
 * then tells the trip module to add the attraction.
 */

//$(document).onReady()
$(function () {

    // jQuery selects
    var $optionsPanel = $('#options-panel');
    var $hotelSelect = $optionsPanel.find('#hotel-choices');
    var $restaurantSelect = $optionsPanel.find('#restaurant-choices');
    var $activitySelect = $optionsPanel.find('#activity-choices');

  // ~~~~~~~~~~~~~~~~~~~~~~~
    // This looks like a great place to start AJAX work with a request for all attractions. Don't forget that these kinds of requests are async, so we won't have all of the attractions until it comes back, but once it comes back we can make the option tags
  // ~~~~~~~~~~~~~~~~~~~~~~~

     $.get('/api')
      .then(function([allHotels, allRestaurants, allActivities]) {
        allHotels.forEach(makeOption, $hotelSelect);
        allRestaurants.forEach(makeOption, $restaurantSelect);
        allActivities.forEach(makeOption, $activitySelect);
      })
      .catch(console.error.bind(console))

      
      $.ajax({
        method: 'DELETE',
        url: '/api/days'
      });

      
    $.get('/api/days')
      .then(function(allDays){
        
        var dayMods = allDays.forEach(function(day){
          return tripModule.load(day);
        })
     
    });
    
    $.ajax({
      method: 'POST',
      url: '/api/days',
      data: {number: 1}
    })
      .then(function(day){
        //console.log(day);
      })

    $.ajax({
      method: 'POST',
      url: '/api/days',
      data: {number: 2}
    })
      .then(function(day){
        //console.log(day);
      })

      $.ajax({
      method: 'POST',
      url: '/api/days',
      data: {number: 3}
    })
      .then(function(day){
        //console.log(day);
      })

//send an ajax request to save day that contains event, when event is added 



    // Once you've made AJAX calls to retrieve this information,
    // call attractions.loadEnhancedAttractions in the fashion
    // exampled below in order to integrate it.
    attractionsModule.loadEnhancedAttractions('hotels', hotels);
    attractionsModule.loadEnhancedAttractions('restaurants', restaurants);
    attractionsModule.loadEnhancedAttractions('activities', activities);

    function makeOption(databaseAttraction) {
        var $option = $('<option></option>') // makes a new option tag
          .text(databaseAttraction.name)
          .val(databaseAttraction.id);
        this.append($option); // add the option to the specific select
    }

    // what to do when the `+` button next to a `select` is clicked
    $optionsPanel.on('click', 'button[data-action="add"]', function () {
        var $select = $(this).siblings('select');
        var type = $select.data('type'); // from HTML data-type attribute
        var id = $select.find(':selected').val();
        // get associated attraction and add it to the current day in the trip
        var attraction = attractionsModule.getByTypeAndId(type, id);
        tripModule.addToCurrent(attraction);
    });

});
