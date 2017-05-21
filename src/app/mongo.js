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
const uri = process.env.MONGODB_URI;


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
const isSeeded = (() => {
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
})();


// Store commute context fields in the heroku mongodb commute collection
const addUserCommute = (db, commute, callback) => {
    
    db.commutes.updateOne(
        {
            psid : commute.facebook_sender_id 
        },
        {   $set: {
                psid: commute.facebook_sender_id,
                origin: commute.origin,
                destination: commute.destination,
                arrival: commute.time,
                mode: commute.travel_mode,
                preference: commute.transit_mode
            }
        },
        {   
            upsert : true 
        },
        (err, result) => {
            assert.equal(err, null);
            console.log(result);
            callback();
        }
    );

};


// Add a default commute to the db
const addCommute = (commute) => {
    mongodb.connect(uri, (err, db) => {
        assert.equal(null, err);
        
        addUserCommute(db, commute, () => {
            db.close();
        })
    });
};


// Exports 
exports.addCommute = addCommute;