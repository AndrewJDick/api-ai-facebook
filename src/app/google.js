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


// Packages
const nodeGeocoder = require('node-geocoder');
const geocoder = nodeGeocoder({
  provider: 'google',
  httpAdapter: 'https',
  apiKey: 'AIzaSyDodAp8X1I7gbRdnvuv_0Pu-l6HQuGBJWE', // TODO: Create env var
  formatter: null
});


// Converts api.ai @sys.address entity to LatLng coordinates
const latLng = (commuteContext, prop) => {

	let commute = {};
	let props = commuteContext.parameters;

    return geocoder.geocode(props[prop])
        .then((value) => {
	            
            return commute = Object.defineProperty(props, prop, {
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
			console.error(reason)
		});

};


// Exports
exports.addressToCoords = addressToCoords;
