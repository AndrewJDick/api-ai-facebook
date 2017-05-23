'use strict';

// Environment Variables
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// Packages
const moment = require('moment');
const nodeGeocoder = require('node-geocoder');

const geocoder = nodeGeocoder({
  provider: 'google',
  httpAdapter: 'https',
  apiKey: GOOGLE_API_KEY,
  formatter: null
});

const googleMapsClient = require('@google/maps').createClient({
  key: GOOGLE_API_KEY
});


// Converts api.ai @sys.address entity to LatLng coordinates
const latLng = (commuteContext, prop) => {

    // TODO: Refactor to use @google/maps 
    return geocoder.geocode(commuteContext[prop])
        .then((value) => {
            let coords = `${value[0].latitude},${value[0].longitude}`;
            return addConversionProp(commuteContext, prop, coords);
        }, (reason) => {
            console.error(reason);
        });
};


// Returns JSON object with transformed waypoints
const addressToCoords = (commuteContext) => {  

    let origin = new Promise((resolve, reject) => { 
        resolve(latLng(commuteContext, 'origin'));
    });

    let destination = new Promise((resolve, reject) => { 
        resolve(latLng(commuteContext, 'destination'));
    });

    return Promise.all([origin, destination])
        .then((values) => {
            return vaxlues;
        }, (reason) => {
            console.error(reason);
        });
};


// Converts the user's arrival time to a unix timestamp
const datetimeToUnix = (commuteContext, prop, customDate = false) => {

    let timestampDate = (!customDate)
        ? new Date().toISOString().split('T')[0]    // Defaults to 'today'
        : commuteContext.arrivalDate;               // YYYY-MM-DD (TODO: Add field to CommuteContext)

    let timestampTime = commuteContext.arrival;                
    
    let timestampUnix = moment(`${timestampDate} ${timestampTime}`, moment.ISO_8601).unix();

    return addConversionProp(commuteContext, prop, timestampUnix);
};


// Adds a new property to an object with the .converted suffix
const addConversionProp = (obj, prop, value) => {

    return Object.defineProperty(obj, `${prop}.converted`, {
        value: value,
        writable: true,
        enumerable: true,
        configurable: true
    });
};


// Create a journey from supplied arguments
const commuteDirections = (commuteContext) => {

    let commute = {
        origin: commuteContext.origin.coverted,
        destination: commuteContext.destination.coverted,
        arrival_time: commuteContext.arrival.converted,
        preference: commuteContext.transit_mode,
        alternatives: true,
        traffic_model: 'pessimistic', // #British
        mode: 'transit',
        region: 'uk',
        units: 'imperial'
    };

    googleMapsClient.directions(commute, (err, response) => {
        if (err) {
            console.error(err);
        } else {
            console.log(response);
        }
    });

}




// Exports
exports.addressToCoords = addressToCoords;
exports.datetimeToUnix = datetimeToUnix;
exports.commuteDirections = commuteDirections;


/*
Sample Google Directions Query
==============================
https://maps.googleapis.com/maps/api/directions/json
?origin=51.6564890,-0.3903200
&destination=51.5238910,-0.0968820
&key=AIzaSyDodAp8X1I7gbRdnvuv_0Pu-l6HQuGBJWE
&mode=transit
&units=imperial
&arrival_time=1494579600
&alternatives=true
*/
