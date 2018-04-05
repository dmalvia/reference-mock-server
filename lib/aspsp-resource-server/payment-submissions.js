const uuidv4 = require('uuid/v4');
const { postResponse } = require('./payments.js');

const postPaymentSubmissionsResponse = (paymentSubmissionId, paymentId, status) => ({
  Data: {
    PaymentSubmissionId: paymentSubmissionId,
    PaymentId: paymentId,
    Status: status,
    CreationDateTime: `${(new Date()).toISOString().slice(0, -5)}+00:00`,
  },
  Links: {
    Self: `/open-banking/v1.1/payment-submissions/${paymentSubmissionId}`,
  },
  Meta: {},
});

const paymentSubmissionResponse = (req, res) => {
  const paymentSubmissionId = uuidv4();
  const paymentId = req.body.Data.PaymentId;
  const responsePayload = postPaymentSubmissionsResponse(paymentSubmissionId, paymentId, 'AcceptedSettlementInProcess');
  return postResponse(req, res, responsePayload);
};

const paymentSubmissionsMiddleware = (req, res, next) => {
  if (req.path.indexOf('/open-banking/v1.1/payment-submissions') === -1) {
    return next();
  }
  switch (req.method) {
    case 'POST':
      return paymentSubmissionResponse(req, res);
    default:
      return res.sendStatus(400);
  }
};

exports.postPaymentSubmissionsResponse = postPaymentSubmissionsResponse;
exports.paymentSubmissionsMiddleware = paymentSubmissionsMiddleware;
