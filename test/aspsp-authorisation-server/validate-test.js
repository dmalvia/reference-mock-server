const assert = require('assert');
const { validate } = require('../../lib/aspsp-authorisation-server/validate');

const ValidationException = require('../../lib/errors/ValidationException');
const RedirectionException = require('../../lib/errors/RedirectionException');

const state = '123456';
const aspspCallbackRedirectionUrl = 'http://example.com/aaa-bank-url';

const refQuery = {
  redirect_uri: aspspCallbackRedirectionUrl,
  state,
  client_id: 'ABC',
  response_type: 'code',
  request: 'jwttoken',
  scope: 'openid accounts',
};

describe('Validate query params for /:id/authorize endpoint', () => {
  it('validates valid query for accounts flow', () => {
    const query = Object.assign({}, refQuery);
    assert.doesNotThrow(() => { validate(query); }, Error);
  });

  it('validates valid query for payments flow', () => {
    const query = Object.assign({}, refQuery, { scope: 'openid payments' });
    assert.doesNotThrow(() => { validate(query); }, Error);
  });

  it('validates query with invalid scope ', () => {
    const query = Object.assign({}, refQuery, { scope: 'openid invalid' });
    assert.throws(() => { validate(query); }, RedirectionException, 'Redirection due to invalid_scope');
  });

  it('validates query with missind redirect_uri ', () => {
    const query = Object.assign({}, refQuery, { redirect_uri: null });
    assert.throws(() => { validate(query); }, ValidationException);
  });

  it('validates query with missind client_id ', () => {
    const query = Object.assign({}, refQuery, { client_id: null });
    assert.throws(() => { validate(query); }, ValidationException);
  });

  it('validates query with missing request ', () => {
    const query = Object.assign({}, refQuery, { request: null });
    assert.throws(() => { validate(query); }, RedirectionException, 'Redirection due to invalid_request');
  });

  it('validates query with unsupported response type ', () => {
    const query = Object.assign({}, refQuery, { response_type: 'unsupported' });
    assert.throws(() => { validate(query); }, RedirectionException, 'Redirection due to unsupported_response_type');
  });
});
