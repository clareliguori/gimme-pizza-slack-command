'use strict';

const AWS = require('aws-sdk');
const express = require('express');
const utils = require('./utilities.js');

const encryptedSlackToken = process.env.encryptedSlackToken;
let token;

const PORT = 8080;
const HOST = '0.0.0.0';

const app = express();

function processRequest(params, callback) {
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
      callback(null, `${user} asked for pizza in #${channel}.\n${orderOutput}`);
    }
  );
}

app.get('/', (request, response) => {
  const done = (err, res) => response.status(err ? '400' : '200').send(err ? (err.message || err) : res);

  if (token) {
    // Container reuse, simply process the request with the key in memory
    processRequest(request.query, done);
  } else if (encryptedSlackToken && encryptedSlackToken !== '<encryptedSlackToken>') {
    const cipherText = { CiphertextBlob: new Buffer(encryptedSlackToken, 'base64') };
    const kms = new AWS.KMS();
    kms.decrypt(cipherText, (err, data) => {
      if (err) {
        console.log('Decrypt error:', err);
        return done(err);
      }
      token = data.Plaintext.toString('ascii');
      processRequest(request, done);
    });
  } else {
    done('Token has not been set.');
  }
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
