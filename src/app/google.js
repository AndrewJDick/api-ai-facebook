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
 
  // Optional depending on the providers 
  httpAdapter: 'https',
  apiKey: 'AIzaSyDodAp8X1I7gbRdnvuv_0Pu-l6HQuGBJWE', // TODO: Create env var
  formatter: null
});

// Logic
var latLng = (commuteContext) => {

	let props = commuteContext.parameters;

    const fooBar = (props, prop) => {

        let bar = {};

        // console.log(`1: ${prop}`); // field
        // console.log(`2: ${props[prop]}`); // value
        geocoder.geocode(props[prop]).then((response) => {
            
            return bar = Object.defineProperty(props, prop, {
                value: `${response[0].latitude},${response[0].longitude}`
            });

        }).catch((err) => {
            console.log(err);
        });
    };

    var origin = new Promise((resolve, reject) => { 
		var one = resolve(fooBar(props, 'origin'));
		resolve(one);
	}); 

	var destination = new Promise((resolve, reject) => { 
		var two = resolve(fooBar(props, 'destination'));
		resolve(two);
	});

    Promise.all([origin, destination]).then(values => { 
		console.log('values');
		console.log(values);
	}, reason => {
		console.log(reason)
	});
    
};

exports.latLng = latLng;
