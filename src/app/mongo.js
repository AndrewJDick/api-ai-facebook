/*
 * Copyright (c) 2017 ObjectLabs Corporation
 * Distributed under the MIT license - http://opensource.org/licenses/MIT
 *
 * Written with: mongodb@2.2.21
 * Documentation: http://docs.mongodb.org/ecosystem/drivers/node-js/
 * A Node script connecting to a MongoDB database given a MongoDB Connection URI.
*/

// Packages
const mongodb = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const assert = require('assert');


const uri = 'mongodb://admin:root@ds137441.mlab.com:37441/heroku_sxrcs6jm';


// Dummy data
const seedDb = (db, closeDb) => {
    db.collection('commutes').insert([{
        psid: '9999999999999999',
        origin: '51.6564890,-0.3903200',
        destination: '51.5238910,-0.0968820',
        arrival: '09:00:00',
        mode: 'transit',
        preference: 'rail'
    },
    {
        psid: '5555555555555555',
        origin: '51.475579,-0.064370',
        destination: '51.5238910,-0.0968820',
        arrival: '11:00:00',
        mode: 'driving',
        preference: ''
    },
    {
        psid: '4444444444444444',
        origin: '51.059771,-1.310142',
        destination: '51.5238910,-0.0968820',
        arrival: '17:03:40',
        mode: 'transit',
        preference: 'bus'
    }], (err, result) => {
        assert.equal(err, null);
        console.log("Inserted seed data into the commutes collection.");
        closeDb();
    });
};


// DB Seed
const isSeeded = () => {
    mongodb.connect(uri, (err, db) => {
  
        assert.equal(err, null);

        db.listCollections().toArray((err, collections) => {
            var seeded = false;

            for (collection in collections) {
                if (collections[collection].name === 'commutes') {
                    seeded = true;
                    break;
                }
            }

            if (!seeded) seedDb(db, () => {
                db.close();
            });
        });
    });
}();


// Store commute context fields in the heroku mongodb commute collection
const addUserCommute = (db, commuteContext, closeDb) => {
    db.collection('commutes').insertOne({
        psid: commuteContext.parameters.facebook_sender_id,
        origin: commuteContext.parameters.origin,
        destination: commuteContext.parameters.destination,
        arrival: commuteContext.parameters.time,
        mode: commuteContext.parameters.travel_mode,
        preference: commuteContext.parameters.transit_mode
    }, (err, result) => {
        assert.equal(err, null);
        console.log('Inserted a users default commute into the commutes collection.');
        closeDb();
    });
};


// Add a default commute to the db
const addCommute = (commuteContext) => {
    mongodb.connect(uri, (err, db) => {
        assert.equal(null, err);
        
        addUserCommute(db, commuteContext, () => {
            db.close();
        })
    });
};


// Exports 
exports.addCommute = addCommute;