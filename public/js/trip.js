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

    //create frontend day object
    var newDay = dayModule.create({ number: days.length + 1 }); // creating new dayModule
    days.push(newDay);  //pushing into days array
    if (days.length === 1) {
      currentDay = newDay;
    }

    //1) from frontend, create new frontend day object. 2) Then frontend makes AJAX call to back to update the database with that newDay instance. 3) When new day is created, 4) frontend gets signaled with successful creation. 5) Frontend then knows to move on and switch to that newDay for client display.
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
    if (days.length < 2 || !currentDay) return;

    //from front, make ajax call to delete day in db
    $.ajax({
       method: 'DELETE',
       url: "/api/days/" + currentDay.number
    })
    .then((response) => {
    //when day is successfully deleted in db, update currentDay on the frontend and update client display to show that day was deleted

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

      $.get('/api/days')    //when we retrieve existing info from db, we need to make sure that our sequelize query is returning join table of all hotels/rests/activities associated with Day. This way, we have all the attraction database instances back so that we can pass them into when creating a new day object. If the databaseDay has attractions, it will be returned and passed in to the front end.

      //now, all attractions existing on the backend are associated with the right front-end day object. When switchTo(newDay) is called, it will call dayModule.show(), which will show all the attractions associated with the day object
      /*
      1). upon page refresh, frontend makes AJAX call to db to get back all day instances.
        1a). the call to the db also asks to get back all attractions associated with the day (join tables)
      2). backend sends back all days in db
      3). frontend receives all days. Starts looping thru and for each, create a new day object. Associate attractions from the backend to the new frontend object.
      4) push in new frontend day obj to frontend day array.
      5) call switchTo(newDay) on frontend.
        5a). switchTo will send call to show all attractions associated with a frontend day obj. The frontend day obj got all its attractions from its parallel db instance.
       */

        .then((allDays) => {
          allDays.forEach((day) => {
            var newDay = dayModule.create({
              number: day.number,
              hotel: day.hotel,
              restaurants: day.restaurants,
              activities: day.activities
            })

            days.push(newDay);

            if (days.length === 1) {
              currentDay = newDay;
            }
            switchTo(newDay);
          })
        })
    },

    switchTo: switchTo,

    addToCurrent: function (attraction) {
      //show attraction on front end
      currentDay.addAttraction(attraction);

      //1) add attraction to frontend display. 2) make the AJAX calls below to associate attraction with the right day instance in the backend. So that when page refresh, 1) frontend ajax call asks for all days back. 2) db sends them back, along with each day's associated attractions. 3) frontend gets both day and its attractions, and is able to create a frontend day obj. 4) frontend renders day obj along with its associated attractions, which came from data from the backend.
      $.ajax({
          method: "POST",
          url: "/api/days/" + currentDay.number + "/" + attraction.type,
          data: {id: attraction.id}
      });

  },

    removeFromCurrent: function (attraction) {
      currentDay.removeAttraction(attraction);

      $.ajax({
          method: "DELETE",
          url: "/api/days/" + currentDay.number + "/" + attraction.type,
          data: {id: attraction.id}
      });
    }

  };

  return publicAPI;

}());
