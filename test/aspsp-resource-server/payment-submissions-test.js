const express = require('express');
const assert = require('assert');
const request = require('supertest'); // eslint-disable-line
const { postPaymentSubmissionsResponse } = require('../../lib/aspsp-resource-server/payment-submissions.js');
const { paymentSubmissionsMiddleware } = require('../../lib/aspsp-resource-server');
const { requestPayload } = require('./payments-test.js');

const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(paymentSubmissionsMiddleware);

const paymentId = '123';
const paymentSubmissionId = '456';

describe('postPaymentsResponse', () => {
  it('creates response based on request', () => {
    const status = 'AcceptedSettlementInProcess';
    const response = postPaymentSubmissionsResponse(paymentSubmissionId, paymentId, status);
    const data = response.Data;
    assert.ok(data.CreationDateTime);

    assert.equal(data.PaymentSubmissionId, paymentSubmissionId);
    assert.equal(data.PaymentId, paymentId);
    assert.equal(data.Status, status);
  });
});

describe('paymentsMiddleware', () => {
  process.env.VERSION = 'v1.1';
  const payload = () => {
    requestPayload.Data = Object.assign(requestPayload.Data, { PaymentId: paymentId });
    return requestPayload;
  };

  it('handles /payments request', (done) => {
    request(app)
      .post('/open-banking/v1.1/payment-submissions')
      .set('authorization', `Bearer ${process.env.ACCESS_TOKEN}`)
      .send(payload())
      .end((err, res) => {
        assert.equal(res.status, 201);
        const data = res.body.Data;
        assert.ok(data.PaymentId);
        assert.ok(data.PaymentSubmissionId);
        assert.deepEqual(data.Status, 'AcceptedSettlementInProcess');
        done();
      });
  });
});
