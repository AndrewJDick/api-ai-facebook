'use strict';

// Packages
const mongodb = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const assert = require('assert');


// Environment Variables
const uri = process.env.MONGODB_URI;


// Dummy data
const insertSeed = (db, callback) => {
    db.collection('commutes').insert([{
        psid: '9999999999999999',
        origin: {
            parsed: 'EC1 9HX',
            original: 'my origin is EC1 9HX',
            converted: '51.5239871,-0.0971759'
        },
        destination: {
            parsed: 'KA22 7PN',
            original: 'My destination is KA22 7PN',
            converted: '55.6571562,-4.8180135'
        },
        arrival: {
            parsed: '09:00:00',
            original: 'I wish to arrive at 9am',
            converted: '1495443600'
        },
        mode: {
            parsed: 'transit',
            original: 'I take public transport'
        },
        preference: {
            parsed: 'rail',
            original: 'I prefer the train'
        }
    }], (err, result) => {
        assert.equal(err, null);
        console.log("Inserted seed data into the commutes collection.");
        callback();
    });
};


// DB seed on deploy
const isSeeded = (() => {
    mongodb.connect(uri, (err, db) => {
  
        assert.equal(err, null);

        db.listCollections().toArray((err, collections) => {
            let seeded = false;

            for (let collection in collections) {
                if (collections[collection].name === 'commutes') {
                    seeded = true;
                    break;
                }
            }

            if (!seeded) insertSeed(db, () => {
                db.close();
            });
        });
    });
})();


// Add or update a user's commute in the mongoDB commutes collection
const addCommute = (db, commute, callback) => {
    
    console.log('adding commute'); 

    db.collection('commutes').updateOne(
        {
            psid : commute.facebook_sender_id 
        },
        {   
            $set: {
                psid: commute.facebook_sender_id,
                origin: {
                    parsed: commute.origin,
                    original: commute['origin.original'],
                    converted: commute['origin.converted']
                },
                destination: {
                    parsed: commute.destination,
                    original: commute['destination.original'],
                    converted: commute['destination.converted']
                },
                arrival: {
                    parsed: commute.arrival,
                    original: commute.['arrival.original'],
                    converted: commute['arrival.converted']
                },
                mode: {
                    parsed: commute.travel_mode,
                    original: commute['travel_mode.original']
                },
                preference: {
                    parsed: commute.transit_mode,
                    original: commute['transit_mode.original']
                }
            },
        },
        {   
            upsert : true 
        },
        (err, result) => {
            assert.equal(err, null);

            let addOrUpdate = (result.modifiedCount === 0 && result.upsertedCount === 1) 
                ? 'New user commute added to the commutes collection' 
                : 'Existing user commute updated to the commutes collection';

            console.log(addOrUpdate);
            callback();
        }
    );
};


const dbConnect = (obj, method) => {
    console.log('connecting to db');

    mongodb.connect(uri, (err, db) => {
        
        console.log('connected to db');

        assert.equal(null, err);
        
        switch(method) {
            case 'addCommute':
                addCommute(db, obj, () => {
                    db.close();
                })
                break;
            default:
                db.close();
                break;
        }
    });
};


// Exports 
exports.dbConnect = dbConnect;