const express = require('express');
const assert = require('assert');
const request = require('supertest'); // eslint-disable-line
const { postPaymentsResponse } = require('../../lib/aspsp-resource-server/payments.js');
const { paymentsMiddleware } = require('../../lib/aspsp-resource-server');

const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(paymentsMiddleware);

const risk = {};
const requestPayload = {
  Data: {
    Initiation: {
      InstructionIdentification: 'ACME412',
      EndToEndIdentification: 'FRESCO.21302.GFX.20',
      InstructedAmount: {
        Amount: '165.88',
        Currency: 'GBP',
      },
      CreditorAccount: {
        SchemeName: 'SortCodeAccountNumber',
        Identification: '08080021325698',
        Name: 'ACME Inc',
        SecondaryIdentification: '0002',
      },
    },
  },
  Risk: risk,
};

describe('postPaymentsResponse', () => {
  it('creates response based on request', () => {
    const paymentId = '123';
    const status = 'AcceptedTechnicalValidation';
    const response = postPaymentsResponse(requestPayload, paymentId, status);
    const data = response.Data;
    assert.ok(data.CreationDateTime);

    assert.equal(data.PaymentId, paymentId);
    assert.equal(data.Status, status);

    assert.deepEqual(data.Initiation, requestPayload.Data.Initiation);
    assert.deepEqual(response.Risk, risk);
  });
});

describe('paymentsMiddleware', () => {
  process.env.VERSION = 'v1.1';

  it('handles /payments request', (done) => {
    request(app)
      .post('/open-banking/v1.1/payments')
      .set('authorization', `Bearer ${process.env.ACCESS_TOKEN}`)
      .send(requestPayload)
      .end((err, res) => {
        assert.equal(res.status, 201);
        const data = res.body.Data;
        assert.ok(data.PaymentId);
        assert.deepEqual(data.Status, 'AcceptedTechnicalValidation');
        assert.deepEqual(data.Initiation, requestPayload.Data.Initiation);
        done();
      });
  });
});

exports.requestPayload = requestPayload;
