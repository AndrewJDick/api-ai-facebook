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


// Returns JSON object with transformed waypoints
const addressToCoords = (commuteContext) => {  

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

    let origin = new Promise((resolve, reject) => { 
        resolve(latLng(commuteContext, 'origin'));
    });

    let destination = new Promise((resolve, reject) => { 
        resolve(latLng(commuteContext, 'destination'));
    });

    return Promise.all([origin, destination])
        .then((values) => {
            return values;
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
const commuteDirections = (commute) => {

    let journey = {
        origin: commute['origin.converted'],
        destination: commute['destination.converted'],
        arrival_time: commute['arrival.converted'],
        alternatives: true,
        mode: 'transit',
        region: 'uk',
        units: 'imperial',
        traffic_model: 'pessimistic' 
        //preference: commute.transit_mode 
    };

    // ToDo: This needs to be a promise
    googleMapsClient.directions(journey, (err, response) => {
        if (!err) {
            // ToDo: Do something with this information
            console.log('Directions Response');
            console.log(response.json);
        }
    });
};


// Exports
exports.addressToCoords = addressToCoords;
exports.datetimeToUnix = datetimeToUnix;
exports.commuteDirections = commuteDirections;
