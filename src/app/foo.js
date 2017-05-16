// ****************************************************************************************************
//
// This file currently does nothing. I'm just being lazy and storing the address to lat/lng conversions 
//
// ****************************************************************************************************

// if (req.body.result.action === 'arrivapi.default.submit') {

//     const waypoint = req.body.result.action.split('.').pop();

//     geocoder.geocode(commuteContext.parameters[waypoint]).then((response) => {
        
//         commuteContext.parameters[waypoint] = `${response[0].latitude},${response[0].longitude}`;
        
//         speech = `${waypoint.charAt(0).toUpperCase() + waypoint.slice(1)} address added: ${response[0].formattedAddress}`;

//         return res.json({
//             speech: speech,
//             source: `arrivapi-default-${waypoint}`,
//             displayText: speech
//        });
//     })
//     .catch((err) => {
//         console.log(err);
//     });
// }