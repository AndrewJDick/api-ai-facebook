'use strict';

// Environment Variables
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// Packages
const nodeGeocoder = require('node-geocoder');
const geocoder = nodeGeocoder({
  provider: 'google',
  httpAdapter: 'https',
  apiKey: GOOGLE_API_KEY,
  formatter: null
});


// Converts api.ai @sys.address entity to LatLng coordinates
const latLng = (commuteContext, prop) => {

    return geocoder.geocode(commuteContext[prop])
        .then((value) => {
	            
            return commuteContext = Object.defineProperty(commuteContext, prop, {
                value: `${value[0].latitude},${value[0].longitude}`
            });

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
			return values[0];
		}, (reason) => {
			console.error(reason);
		});
};

const timeToUnix = (commuteContext) => {
	
	let arrivalDate;
	let arrivalTime = commuteContext.arrival;

	let timestamp = moment(`2009-07-15 ${arrivalTime}`).unix()
};


// Exports
exports.addressToCoords = addressToCoords;
exports.dateToUnix = timeToUnix;


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
