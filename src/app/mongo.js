/*
 * Copyright (c) 2017 ObjectLabs Corporation
 * Distributed under the MIT license - http://opensource.org/licenses/MIT
 *
 * Written with: mongodb@2.2.21
 * Documentation: http://docs.mongodb.org/ecosystem/drivers/node-js/
 * A Node script connecting to a MongoDB database given a MongoDB Connection URI.
*/

var mongodb = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var assert = require('assert');
var uri = 'mongodb://admin:root@ds137441.mlab.com:37441/heroku_sxrcs6jm';


// Dummy data
const seedDb = function(db, callback) {
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
    }], function(err, result) {
        assert.equal(err, null);
        console.log("Inserted seed data into the commutes collection.");
        callback();
    });
};


// Store commute context fields in the heroku mongodb commute collection
const userCommute = function(db, commuteContext, callback) {
    console.log('userCommute()');
    db.collection('commutes').insertOne({
        psid: commuteContext.parameters.facebook_sender_id,
        origin: commuteContext.parameters.origin,
        destination: commuteContext.parameters.destination,
        arrival: commuteContext.parameters.time,
        mode: commuteContext.parameters.travel_mode,
        preference: commuteContext.parameters.transit_mode
    }, function(err, result) {
        assert.equal(err, null);
        console.log("Inserted a user's default commute into the commutes collection.");
        callback();
    });
};


// Add a default commute to the db
const addCommute = function(commuteContext) {
    console.log('addCommute()');
    mongodb.connect(uri, function(err, db) {
        assert.equal(null, err);
        
        userCommute(db, commuteContext, function() {
            db.close();
        })
    });
};


// DB Seed
const seed = function() {
    mongodb.connect(uri, function(err, db) {
  
        assert.equal(err, null);

        db.listCollections().toArray(function(err, collections) {
            var seeded = false;

            for (collection in collections) {
                if (collections[collection].name === 'commutes') {
                    seeded = true;
                    break;
                }
            }

            if (!seeded) seedDb(db, function() {
                db.close();
            });
        });
    });
};

seed();

// Exports 
exports.addCommute = addCommute;
exports.userCommute = userCommute;
exports.assert = assert;