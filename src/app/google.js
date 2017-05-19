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
const latLng = (commuteContext) => {

	let props = commuteContext.parameters;
	this.foo = {};

	const bar = () => {
		for (let prop in props) {
			// console.log(`1: ${prop}`); // field
			// console.log(`2: ${props[prop]}`); // value

			if (prop === 'origin' || prop === 'destination') {

				geocoder.geocode(props[prop]).then((response) => {
					
					this.foo = Object.defineProperty(props, prop, {
						value: `${response[0].latitude},${response[0].longitude}`
					});

					console.log('geocode');
					// console.log(this.foo);

				})
				.catch((err) => {
				    console.log(err);
				});
			}

			return this.foo;
		}
	};

	bar().then((response) => {
		console.log('bot');
		console.log(this.foo);
	});
};

exports.latLng = latLng;
