// module.exports = () => {

//   /*
//    * Copyright (c) 2017 ObjectLabs Corporation
//    * Distributed under the MIT license - http://opensource.org/licenses/MIT
//    *
//    * Written with: mongodb@2.2.21
//    * Documentation: http://docs.mongodb.org/ecosystem/drivers/node-js/
//    * A Node script connecting to a MongoDB database given a MongoDB Connection URI.
//   */

//   var mongodb = require('mongodb');
//   var uri = 'mongodb://admin:root@ds137441.mlab.com:37441/heroku_sxrcs6jm';

//   // Dummy data
//   var seedData = [
//     {
//       psid: '',
//       forename: 'Jimmy',
//       surname: 'Plant',
//       origin: [51.6564890, -0.3903200],
//       destination: [51.5238910,-0.0968820],
//       arrival: '09:00:00',
//       mode: 'transit',
//       preference: 'rail'
//     },
//     {
//       psid: '',
//       forename: 'John Paul',
//       surname: 'Bonham',
//       origin: [51.475579, -0.064370],
//       destination: [51.5238910,-0.0968820],
//       arrival: '11:00:00',
//       mode: 'driving',
//       preference: ''
//     },
//     {
//       psid: '',
//       forename: 'Steven',
//       surname: 'Perry',
//       origin: [51.059771, -1.310142],
//       destination: [51.5238910,-0.0968820],
//       arrival: '17:03:40',
//       mode: 'transit',
//       preference: 'bus'
//     },
//   ];

//   // DB Logic
//   mongodb.MongoClient.connect(uri, function(err, db) {
    
//     if(err) throw err;

//     // DB Seed
//     db.listCollections().toArray(function(err, collections) {
//       var seeded = false;

//       for (collection in collections) {
//         if (collections[collection].name === 'commutes') {
//           seeded = true;
//           break;
//         }
//       }

//       if (!seeded) seedDb();
//     });

//     function seedDb() {

//       db.collection('commutes').insert(seedData, function(err, result) {
//         if(err) throw err;
//       });
//     }
//   });

// }