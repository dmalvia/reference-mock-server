const log = require('debug')('log');

const ValidationException = require('../errors/ValidationException');
const RedirectionException = require('../errors/RedirectionException');

const ACCOUNTS_SCOPE = 'openid accounts';
const PAYMENTS_SCOPE = 'openid payments';
const AUTHORISE_RESPONSE_TYPE = 'code';

const INVALID_REQUEST = 'invalid_request';
const UNSUPPORTED_RESPONSE_TYPE = 'unsupported_response_type';
const INVALID_SCOPE = 'invalid_scope';
const ACCESS_DENIED = 'access_denied';
const ACCESS_DENIED_DESC = 'consent authorization rejected';

const validate = (query) => {
  log(`validateAuthorisationParams#query: [${JSON.stringify(query)}]`);
  const redirectionParams = {};
  if (query.state) {
    redirectionParams.state = query.state;
  }
  if (query.cancel) {
    redirectionParams.error = ACCESS_DENIED;
    redirectionParams.error_description = ACCESS_DENIED_DESC;
    throw new RedirectionException(query.redirect_uri, redirectionParams);
  }
  if (!query || !query.redirect_uri || !query.client_id) {
    throw new ValidationException();
  }

  if (!query.request || !query.response_type) {
    redirectionParams.error = INVALID_REQUEST;
    throw new RedirectionException(query.redirect_uri, redirectionParams);
  }
  if (!!query.response_type && query.response_type !== AUTHORISE_RESPONSE_TYPE) {
    redirectionParams.error = UNSUPPORTED_RESPONSE_TYPE;
    throw new RedirectionException(query.redirect_uri, redirectionParams);
  }
  if (!!query.scope && query.scope !== ACCOUNTS_SCOPE && query.scope !== PAYMENTS_SCOPE) {
    redirectionParams.error = INVALID_SCOPE;
    throw new RedirectionException(query.redirect_uri, redirectionParams);
  }
};

exports.validate = validate;
