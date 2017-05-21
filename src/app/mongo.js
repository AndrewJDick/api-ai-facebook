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


// Add or update a user's commute in the mongoDB commutes collection
const addUserCommute = (db, commute, callback) => {
    
    db.collection('commutes').updateOne(
        {
            psid : commute.facebook_sender_id 
        },
        {   
            $setOnInsert: {
                psid: commute.facebook_sender_id,
            },
            $set: {
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

            let addOrUpdate = (result.modifiedCount === 0 && result.upsertedCount === 1) 
                ? 'New user commute added to the commutes collection' 
                : (result.modifiedCount === 1 && result.upsertedCount === 0)
                ? 'Existing user commute updated to the commutes collection'
                : 'Something updated, but I have no idea what...';

            console.log(addOrUpdate);
            callback();
        }
    );
};


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


"origin": "51.47557870000001,-0.0643705",
"destination": "51.56238949999999,-0.1004634",