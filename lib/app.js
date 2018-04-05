const express = require('express');
const { OBAccountPaymentServiceProviders } = require('./ob-directory');
const { createToken, authorise } = require('./aspsp-authorisation-server');
const { openIdConfig } = require('./aspsp-open-id-config');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const errorHandler = require('../lib/errors/error-handler');

const app = express();

if (process.env.NODE_ENV !== 'test') { // don't log requests when testing
  app.use(morgan('dev')); // for logging
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/:id/token', createToken);
app.get('/:id/authorize', authorise);
app.get('/openid/config/:id', openIdConfig.get);
app.use('/scim/v2/OBAccountPaymentServiceProviders', OBAccountPaymentServiceProviders);

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.use(errorHandler.logger);
app.use(errorHandler.handler);

exports.app = app;
