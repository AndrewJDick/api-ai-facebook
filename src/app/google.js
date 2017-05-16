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
const geocoderOptions = {
  provider: 'google',
 
  // Optional depending on the providers 
  httpAdapter: 'https',
  apiKey: 'AIzaSyDodAp8X1I7gbRdnvuv_0Pu-l6HQuGBJWE',
  formatter: null
};

const geocoder = nodeGeocoder(geocoderOptions);

const latLng = function(commuteContext) {
	
	const waypoints = [commuteContext.parameters.origin, commuteContext.parameters.destination];

	for (waypoint in waypoints) {
		geocoder.geocode(waypoints[waypoint]).then((response) => {
	        
			console.log(response);
			
			waypoints[waypoint] = `${response[0].latitude},${response[0].longitude}`;
		    
		})
		.catch((err) => {
		    console.log(err);
		});
	}

	console.log(commuteContext);
};

exports.latLng = latLng;