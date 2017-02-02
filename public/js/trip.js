'use strict';
/* global $ dayModule */

/**
 * A module for managing multiple days & application state.
 * Days are held in a `days` array, with a reference to the `currentDay`.
 * Clicking the "add" (+) button builds a new day object (see `day.js`)
 * and switches to displaying it. Clicking the "remove" button (x) performs
 * the relatively involved logic of reassigning all day numbers and splicing
 * the day out of the collection.
 *
 * This module has four public methods: `.load()`, which currently just
 * adds a single day (assuming a priori no days); `switchTo`, which manages
 * hiding and showing the proper days; and `addToCurrent`/`removeFromCurrent`,
 * which take `attraction` objects and pass them to `currentDay`.
 */

var tripModule = (function () {

  // application state

  var days = [],
      currentDay;

  // jQuery selections

  var $addButton, $removeButton;
  $(function () {
    $addButton = $('#day-add');
    $removeButton = $('#day-title > button.remove');
  });

  // method used both internally and externally

  function switchTo (newCurrentDay) {
    if (currentDay) currentDay.hide();
    currentDay = newCurrentDay;
    currentDay.show();
  }

 // ~~~~~~~~~~~~~~~~~~~~~~~
    // before calling `addDay` or `deleteCurrentDay` that update the frontend (the UI), we need to make sure that it happened successfully on the server
  // ~~~~~~~~~~~~~~~~~~~~~~~
  $(function () {
    $addButton.on('click', addDay);
    $removeButton.on('click', deleteCurrentDay);
  });



  // ~~~~~~~~~~~~~~~~~~~~~~~
    // `addDay` may need to take information now that we can persist days -- we want to display what is being sent from the DB
  // ~~~~~~~~~~~~~~~~~~~~~~~
  function addDay () {

    if (this && this.blur) this.blur(); // removes focus box from buttons
      var newDay = dayModule.create({ number: days.length + 1 }); // creating new dayModule
      days.push(newDay);  //pushing into days array
      if (days.length === 1) {
        currentDay = newDay;
      }

      $.ajax({    //sending request to update database with new day
        method: "POST",
        url: "/api/days",
        data: {number: newDay.number}
      })
        .then((day) => {
          switchTo(newDay);   //switch to newDay to show active button
        })

  }

  // ~~~~~~~~~~~~~~~~~~~~~~~
    // Do not delete a day until it has already been deleted from the DB
  // ~~~~~~~~~~~~~~~~~~~~~~~
  function deleteCurrentDay () {
    // prevent deleting last day

    $.ajax({
       method: 'DELETE',
       url: "/api/days/" + currentDay.number
    })
      .then((response) => {
      //  console.log(response);

        if (days.length < 2 || !currentDay) return;
        // remove from the collection
        var index = days.indexOf(currentDay),
          previousDay = days.splice(index, 1)[0],
          newCurrent = days[index] || days[index - 1];
        // fix the remaining day numbers
        days.forEach(function (day, i) {
          day.setNumber(i + 1);
        });
        switchTo(newCurrent);
        previousDay.hideButton();
      })


  }

  // globally accessible module methods

  var publicAPI = {

    load: function () {

      // ~~~~~~~~~~~~~~~~~~~~~~~
        //If we are trying to load existing Days, then let's make a request to the server for the day. Remember this is async. For each day we get back what do we need to do to it?
      // ~~~~~~~~~~~~~~~~~~~~~~~

      $.get('/api/days')    //load to show what's already existing in database
        .then((allDays) => {
          allDays.forEach((day) => {
          //console.log(day);
            var newDay = dayModule.create({number: day.number, hotel: day.hotel, restaurants: day.restaurants, activities: day.activities})
              days.push(newDay);
                if (days.length === 1) {
                  currentDay = newDay;
                  switchTo(newDay);
                }
                
               
             // })
             // hotel = attractionsModule.create('hotel', day.hotelId);
            
            
          })
        })

      //$(addDay);

},

    

    switchTo: switchTo,

    addToCurrent: function (attraction) {

      currentDay.addAttraction(attraction);

      if (attraction.type === "hotel" ){
        $.ajax({
          method: "POST",
          url: "/api/days/" + currentDay.number,
          data: {hotelId: attraction.id}
        })
        .then((day) => {
         // console.log('saved hotelId')
        })
      }
      if (attraction.type === "restaurant"){
        $.ajax({
          method: "POST",
          url: "/api/days/" + currentDay.number + "/restaurant",
          data: {restaurantId: attraction.id}
        })
      }
    if (attraction.type === "activity"){
        $.ajax({
          method: "POST",
          url: "/api/days/" + currentDay.number + "/activity",
          data: {activityId: attraction.id}
        })
      }
    
  },

    removeFromCurrent: function (attraction) {
      currentDay.removeAttraction(attraction);
    }

  };

  return publicAPI;

}());
