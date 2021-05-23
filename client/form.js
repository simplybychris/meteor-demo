import "./form.html";

import { locations } from "./data";
import Pikaday from "pikaday";
import { Session } from "meteor/session";
import moment from "moment";

let datepicker;
Template.Form.onCreated(() => {
  datepicker = new ReactiveVar(0);
});

Session.setDefault("hoursFrom", []);
Session.setDefault("hoursTo", []);

Template.Form.onRendered(() => {
  this.$("select").select2({
    minimumResultsForSearch: 10,
    placeholder: "Select something...",
  });

  datepicker = new Pikaday({
    field: $("#datepicker").get(0),
    format: "YYYY-MM-DD",
    minDate: new Date(),
    onSelect: function () {
      console.log(this.getMoment());
    },
  });

  // max_advance_time = time in hours how far in the future to allow selection
  // max_duration = time in minutes how long one selection can take
});

Template.Form.helpers({
  locations: () => locations.get(),

  hoursFrom: () => {
    return Session.get("hoursFrom");
  },

  hoursTo: () => {
    return Session.get("hoursTo");
  },
});

Template.Form.events({
  "change #location": (e) => {
    const locationsData = locations.get();

    let selectedLocation = "";
    for (let i = 0; i < locationsData.length; i++) {
      if (e.target.value == locationsData[i].id) {
        console.log("Picked location: ", locationsData[i]);
        selectedLocation = locationsData[i];
        /*
        {{#each}} currently only accepts arrays, cursors or falsey values

        if time_from inside json object is an array => add to session, 
        else => put it in the array and add to session 
        */
        if (Array.isArray(locationsData[i].time_from)) {
          Session.set("hoursFrom", locationsData[i].time_from);
        } else {
          Session.set("hoursFrom", [locationsData[i].time_from]);
        }

        if (Array.isArray(locationsData[i].time_to)) {
          Session.set("hoursTo", locationsData[i].time_to);
        } else {
          Session.set("hoursTo", [locationsData[i].time_to]);
        }
      }
    }

    const hours = selectedLocation.max_advance_time;
    /*
    if there is provided max_advance_time => set max date range,
    else => reset max range
    */
    if (hours !== null) {
      const maxDate = moment(moment()).add(hours, "hours").toDate();
      datepicker.setMaxDate(maxDate);
    } else {
      datepicker.setMaxDate();
    }
    //reset input value
    $("#datepicker").val("Select another date");
  },
});
