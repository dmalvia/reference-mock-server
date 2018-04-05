const { paymentsMiddleware } = require('./payments');
const { paymentSubmissionsMiddleware } = require('./payment-submissions');

exports.paymentsMiddleware = paymentsMiddleware;
exports.paymentSubmissionsMiddleware = paymentSubmissionsMiddleware;
