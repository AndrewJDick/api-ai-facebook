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
        previous: {
            origin: {
                parsed: 'SW1A 0AA',
                original: 'my origin is SW1A 0AA',
                converted: '51.499840,-0.124663'
            },
            destination: {
                parsed: 'EC4M 8AD',
                original: 'My destination is EC4M 8AD',
                converted: '51.514274,-0.098992'
            },
            arrival: {
                parsed: '17:00:00',
                original: 'I wish to arrive at 5pm',
                converted: '1495443600'
            },
            preference: {
                parsed: ['rail'],
                original: 'I prefer the train'
            }
        },
        default: {
            origin: {
                parsed: 'N4 2JW',
                original: 'Im coming from N4 2JW',
                converted: '51.562389,-0.100463'
            },
            destination: {
                parsed: 'EC1 9HX',
                original: 'Im heading to EC1 9HX',
                converted: '51.523987,-0.097176'
            },
            arrival: {
                parsed: '08:30:00',
                original: 'I wish to arrive at 8:30am',
                converted: '1495443600'
            },
            preference: {
                parsed: ['rail', 'bus'],
                original: 'I prefer the train and the bus'
            }
        }
    }], (err, result) => {
        assert.equal(err, null);
        console.log("Inserted seed data into commutes collection.");
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
const addCommute = (db, commute, isDefault, callback) => {

    let journey = (isDefault) ? 'default' : 'previous';

    db.collection('commutes').updateOne(
        {
            psid : commute.facebook_sender_id 
        },
        {   
            $set: {
                [journey]: {
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
                        original: commute['arrival.original'],
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
                }
            }
        },
        {   
            upsert : true 
        },
        (err, result) => {
            assert.equal(err, null);

            // ToDo: Update text response to cover all potential responses (if deafault, etc)
            let addOrUpdate = (result.modifiedCount === 0 && result.upsertedCount === 1) 
                ? 'New user commute added.' 
                : 'Existing user commute updated.';

            console.log(addOrUpdate);
            callback();
        }
    );
};


const dbConnect = (obj, method) => {
    mongodb.connect(uri, (err, db) => {

        assert.equal(null, err);
        
        switch(method) {
            case 'addCommute':
                addCommute(db, obj, false, () => {
                    db.close();
                });
                break;
            case 'addCommuteDefault':
                addCommute(db, obj, true, () => {
                    db.close()
                });
                break;
            default:
                db.close();
                break;
        }
    });
};


// Exports 
exports.dbConnect = dbConnect;