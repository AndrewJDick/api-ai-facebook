'use strict';

// Environment Variables
const REST_PORT = (process.env.PORT || 5000);
const FB_VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;

// Packages
const app = require('express')();
const bodyParser = require('body-parser');
const JSONbig = require('json-bigint');
const async = require('async');

// App
const mongo = require('./app/mongo');
const google = require('./app/google');
const facebook = require('./app/facebook');
let facebookBot = new facebook.FacebookBot();


// Logic
app.use(bodyParser.text({type: 'application/json'}));

app.get('/webhook/', (req, res) => {

    if (req.query['hub.verify_token'] === FB_VERIFY_TOKEN) {
        res.send(req.query['hub.challenge']);

        setTimeout(() => {
            facebookBot.doSubscribeRequest();
        }, 3000);
    } else {
        res.send('Error, wrong validation token');
    }
});

app.post('/webhook/', (req, res) => {

    try {
        let data = JSONbig.parse(req.body);
        let contexts = data.result.contexts;
        let commuteContext = {};
        let speech = '';

        // Store the Default Commute object built from the API.ai bot.
        for (let context of contexts) {
            if (context.name === 'generic') {
                commuteContext = context.parameters;
            }
        }

        // FB User
        const user = commuteContext.facebook_sender_id;

        // Delay between FB messages
        const delay = (t) => {
           return new Promise((resolve) => { 
               setTimeout(resolve, t);
           });
        };

        if (data.result) {

            if (data.result.action === 'trainbot.journey.platform') {

                // Announces platform after a 20 second delay
                facebookBot.sendFBMessage(user, { 
                    text: `Cool. Will tell you ASAP. ⏰` 
                }).then(() => { 
                    return delay(10000).then(() => { 
                        return facebookBot.sendFBMessage(user, { 
                            text: `The 19.18 will be leaving from platform 6, so you've got just over 12 minutes.`,
                            quick_replies: [
                                {
                                    "content_type": "text",
                                    "title": "Thanks!",
                                    "payload": "Thanks!"
                                },
                                {
                                    "content_type": "text",
                                    "title": "Buzz me five mins before it leaves",
                                    "payload": "Buzz me five mins before it leaves"
                                }
                            ]
                        });
                    })
                }); 
            }

            if (data.result.action === 'trainbot.trust.trigger') {
                // 
                facebookBot.sendFBMessage(user, { 
                    text: `Hey. Glad you made your train!` 
                }).then(() => { 
                    return delay(2000).then(() => { 
                        return facebookBot.sendFBMessage(user, { 
                            text: `Would you like to hear about some other ways I can help you out? Won't take long, I promise.`,
                            quick_replies: [
                                {
                                    "content_type": "text",
                                    "title": "Sure! Why not",
                                    "payload": "Sure! Why not"
                                },
                                {
                                    "content_type": "text",
                                    "title": "Not right now",
                                    "payload": "Not right now"
                                },
                                {
                                    "content_type": "text",
                                    "title": "Who are you, exactly?",
                                    "payload": "Who are you, exactly?"
                                }
                            ]
                        });
                    })
                });   
            }

            if (data.result.action === 'trainbot.trust.whynot') {

                // 
                facebookBot.sendFBMessage(user, { 
                    text: `OK. Tell you what. You tell me about your regular journeys, and I'll help you avoid disruption before it affects you.` 
                }).then(() => { 
                    return delay(2000).then(() => { 
                        return facebookBot.sendFBMessage(user, { 
                            text: `Because I can send you, at exactly the right moment, really useful stuff like:`
                        });
                    })
                }).then(() => { 
                    return delay(2000).then(() => { 
                        return facebookBot.sendFBMessage(user, { 
                            text: `The 06.57 is running 12 mins late. Relax. Give someone an extra kiss.`
                        });
                    }); 
                }).then(() => { 
                    return delay(2000).then(() => { 
                        return facebookBot.sendFBMessage(user, { 
                            text: `Don't forget there's a tube strike tomorrow morning. Get an earlier train, maybe?`
                        });
                    }); 
                }).then(() => { 
                    return delay(2000).then(() => { 
                        return facebookBot.sendFBMessage(user, { 
                            text: `Bank Station is rammed this morning. You'd be better off walking from Liverpool St.`
                        });
                    }); 
                }).then(() => { 
                    return delay(2000).then(() => { 
                        return facebookBot.sendFBMessage(user, { 
                            text: `Would you like to give it a try?`,
                            quick_replies: [
                                {
                                    "content_type": "text",
                                    "title": "Yeah, sounds good",
                                    "payload": "Yeah, sounds good"
                                },
                                {
                                    "content_type": "text",
                                    "title": "I don't trust you.",
                                    "payload": "I don't trust you."
                                }
                            ]
                        });
                    }); 
                }); 
            }

            if (data.result.action === 'arrivapi.default.submit') {

                // Convert addresses to LatLng cords
                let waypointConversion = new Promise((resolve, reject) => {
                    resolve(google.addressToCoords(commuteContext));
                });

                // Covert arrival time to Unix timestamp
                let datetimeConversion = new Promise((resolve, reject) => {
                    resolve(google.datetimeToUnix(commuteContext, 'arrival'));
                });
                    
                // Generate Journey Directions
                let userCommute = Promise.all([waypointConversion, datetimeConversion]).then(() => {  
                    
                    // Generate journey directions
                    google.commuteDirections(commuteContext);
                    
                    // Store the latest journey & directions in MongoDB
                    mongo.dbConnect(commuteContext, 'addCommute');
                });
            }
        }

        if (data.entry) {

            let entries = data.entry;
            entries.forEach((entry) => {
                let messaging_events = entry.messaging;
                if (messaging_events) {
                    messaging_events.forEach((event) => {
                        if (event.message && !event.message.is_echo) {

                            if (event.message.attachments) {
                                let locations = event.message.attachments.filter(a => a.type === "location");

                                // delete all locations from original message
                                event.message.attachments = event.message.attachments.filter(a => a.type !== "location");

                                if (locations.length > 0) {
                                    locations.forEach(l => {
                                        let locationEvent = {
                                            sender: event.sender,
                                            postback: {
                                                payload: "FACEBOOK_LOCATION",
                                                data: l.payload.coordinates
                                            }
                                        };

                                        facebookBot.processFacebookEvent(locationEvent);
                                    });
                                }
                            }

                            facebookBot.processMessageEvent(event);
                        } else if (event.postback && event.postback.payload) {
                            if (event.postback.payload === "FACEBOOK_WELCOME") {
                                facebookBot.processFacebookEvent(event);
                            } else {
                                facebookBot.processMessageEvent(event);
                            }
                        }
                    });
                }
            });
        }

        return res.status(200).json({
            status: "ok"
        });
    } catch (err) {
        return res.status(400).json({
            status: "error",
            error: err
        });
    }
});

app.listen(REST_PORT, () => {
    console.log('Rest service ready on port ' + REST_PORT);
});

facebookBot.doSubscribeRequest();
