/**
 * A VERY Basic Authorization server which compares client_id and client_secret
 * (hard coded - see .env.sample file for values) to what is expected.
 * If credentials match then an auth token is returned.
 */
const AuthenticationException = require('../errors/AuthenticationException');
const ValidationException = require('../errors/ValidationException');

const ONE_HOUR = 3600;
const GRANT_AUTHORIZATION_CODE = 'authorization_code';
const GRANT_CLINET_CREDENTIALS = 'client_credentials';

const ERROR_INVALID_REQUEST = 'invalid_request';
const ERROR_INVALID_CLIENT = 'invalid_client';
const ERROR_UNSUPPORTED_GRANT_TYPE = 'unsupported_grant_type';

const clientCredentials = () => ({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

/**
 * Stupidly simple function to make access token
 */
const makeAccessToken = () => process.env.ACCESS_TOKEN || '';

/*
 * Use Basic Authentication Scheme: https://tools.ietf.org/html/rfc2617#section-2
 */
const credentials = (id, secret) => {
  const basicCredentials = Buffer.from(`${id}:${secret}`).toString('base64');
  return `Basic ${basicCredentials}`;
};

/**
 * @description Very simple auth function to check the grant type and credentials
 * @param grantType
 * @param authorization
 */

const authenticate = (grantType, authorization) => {
  const { clientId, clientSecret } = clientCredentials();
  const expectedCredentials = credentials(clientId, clientSecret);
  if (authorization !== expectedCredentials
    || (grantType !== GRANT_CLINET_CREDENTIALS && grantType !== GRANT_AUTHORIZATION_CODE)) {
    throw (new AuthenticationException()).addPayload({ error: ERROR_INVALID_CLIENT }).addHeader('WWW-Authenticate', grantType);
  }
};

const commonParamsValidation = (grantType, authorization) => {
  if (!grantType) {
    throw (new ValidationException('grant_type missing from request body'))
      .setPayload({ error: ERROR_INVALID_REQUEST });
  }
  if (!authorization) {
    throw (new ValidationException('authorization missing from request headers'))
      .setPayload({ error: ERROR_INVALID_CLIENT });
  }
};

const validateScope = (scope) => {
  if (!scope) {
    throw (new ValidationException('scope missing from request body'))
      .setPayload({ error: ERROR_INVALID_REQUEST });
  }
};

const validateAuthorisationCode = (authorizationCode) => {
  if (!authorizationCode) {
    throw (new ValidationException('authorisation code missing from request body'))
      .setPayload({ error: ERROR_INVALID_REQUEST });
  }
};

const validateRedirectUrl = (redirectUri) => {
  if (!redirectUri) {
    throw (new ValidationException('redirect uri missing from request body'))
      .setPayload({ error: ERROR_INVALID_REQUEST });
  }
};

const isClientCredentialsFlow = grantType => grantType === GRANT_CLINET_CREDENTIALS;
const isAuthorisationCodeFlow = grantType => grantType === GRANT_AUTHORIZATION_CODE;

const createTokenForClientCredentials = (req, res) => {
  const { scope } = req.body;

  validateScope(scope);
  const token = makeAccessToken();

  // Successful Response see: https://tools.ietf.org/html/rfc6749#section-5.1
  res.set('Content-Type', 'application/json; charset=UTF-8');
  res.set('Cache-Control', 'no-store');
  res.set('Pragma', 'no-store');
  return res.json({
    access_token: token,
    expires_in: ONE_HOUR,
    token_type: 'bearer',
    scope,
  });
};

const createTokenForAuthorsationCode = (req, res) => {
  const { 'code': authorizationCode, 'redirect_uri': redirectUri } = req.body;

  validateAuthorisationCode(authorizationCode);
  validateRedirectUrl(redirectUri);
  const token = makeAccessToken();

  // Successful Response see: https://tools.ietf.org/html/rfc6749#section-5.1
  res.set('Content-Type', 'application/json; charset=UTF-8');
  res.set('Cache-Control', 'no-store');
  res.set('Pragma', 'no-store');
  return res.json({
    access_token: token,
    expires_in: ONE_HOUR,
    token_type: 'bearer',
  });
};

const createToken = (req, res) => {
  const grantType = req.body.grant_type;
  const { authorization } = req.headers;

  res.set('Content-Type', 'application/json; charset=UTF-8');
  commonParamsValidation(grantType, authorization);
  authenticate(grantType, authorization);

  if (isClientCredentialsFlow(grantType)) {
    createTokenForClientCredentials(req, res);
  } else if (isAuthorisationCodeFlow(grantType)) {
    createTokenForAuthorsationCode(req, res);
  } else {
    throw (new ValidationException('unsupported grant_type'))
      .setPayload({ error: ERROR_UNSUPPORTED_GRANT_TYPE });
  }
};

exports.credentials = credentials;
exports.createToken = createToken;
