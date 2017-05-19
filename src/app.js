'use strict';

// Packages
const app = require('express')();
const bodyParser = require('body-parser');
const JSONbig = require('json-bigint');

// App
const mongo = require('./app/mongo');
const google = require('./app/google');
const facebook = require('./app/facebook');

// Environment Variables
const REST_PORT = (process.env.PORT || 5000);
const FB_VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;

let facebookBot = new facebook.FacebookBot();

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
                commuteContext = context;
            }
        }

        if (data.result) {

            if (data.result.action === 'arrivapi.default.submit') {

                // ToDo: Convert street address to Lat Lng cords
                google.latLng(commuteContext);

                // Add the user's commute to the db
                //mongo.addCommute(commuteContext);
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
