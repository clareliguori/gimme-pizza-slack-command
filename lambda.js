'use strict';

const AWS = require('aws-sdk');
const qs = require('querystring');
const utils = require('./utilities.js');

const encryptedSlackToken = process.env.encryptedSlackToken;
let token;

function processEvent(event, callback) {
    const params = qs.parse(event.body);
    const requestToken = params.token;
    if (requestToken !== token) {
        console.error(`Request token (${requestToken}) does not match expected`);
        return callback('Invalid request token');
    }

    const user = params.user_name;
    const command = params.command;
    const channel = params.channel_name;
    const commandText = params.text;

  utils.orderPizza(
    function(orderOutput) {
      var commandOutput = {
        "response_type": "in_channel",
        "text": `${user} asked for pizza in #${channel}.\n${orderOutput}`
      };

      callback(null, JSON.stringify(commandOutput));
    }
  );
}

exports.handler = (event, context, callback) => {
    const done = (err, res) => callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? (err.message || err) : res,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (token) {
        // Container reuse, simply process the event with the key in memory
        processEvent(event, done);
    } else if (encryptedSlackToken && encryptedSlackToken !== '<encryptedSlackToken>') {
        const cipherText = { CiphertextBlob: new Buffer(encryptedSlackToken, 'base64') };
        const kms = new AWS.KMS();
        kms.decrypt(cipherText, (err, data) => {
            if (err) {
                console.log('Decrypt error:', err);
                return done(err);
            }
            token = data.Plaintext.toString('ascii');
            processEvent(event, done);
        });
    } else {
        done('Token has not been set.');
    }
};
