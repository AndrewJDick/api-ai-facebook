// Packages
const nodeGeocoder = require('node-geocoder');

// TODO: Replace apiKey with env variable
const geocoderOptions = {
  provider: 'google',
 
  // Optional depending on the providers 
  httpAdapter: 'https',
  apiKey: 'AIzaSyDodAp8X1I7gbRdnvuv_0Pu-l6HQuGBJWE',
  formatter: null
};

const geocoder = nodeGeocoder(geocoderOptions);

const latLng = function(commuteContext) {

	console.log('at least were here');
	
	const waypoints = [commuteContext.parameters.origin, commuteContext.parameters.destination];

	for (waypoint in waypoints) {
		geocoder.geocode(waypoints[waypoint]).then((response) => {
	        
			waypoints[waypoint] = `${response[0].latitude},${response[0].longitude}`;
		    
		})
		.catch((err) => {
		    console.log(err);
		});
	}
};

exports.latLng = latLng;