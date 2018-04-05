const assert = require('assert');
const request = require('supertest'); // eslint-disable-line
const httpMocks = require('node-mocks-http');

const proxyquire = require('proxyquire');
const env = require('env-var');

describe('/authorize endpoint test', () => {
  let authoriseService;
  const state = '123456';
  const aspspCallbackRedirectionUrl = 'http://example.com/aaa-bank-url';
  const authorsationCode = 'ABCD123456789';

  const refQuery = {
    redirect_uri: aspspCallbackRedirectionUrl,
    state,
    client_id: 'ABC',
    response_type: 'code',
    request: 'jwttoken',
    scope: 'openid accounts',
  };

  before(() => {
    process.env.AUTHORISATION_CODE = authorsationCode;
    authoriseService = proxyquire('../../lib/aspsp-authorisation-server/authorise', {
      'env-var': env.mock({
        AUTHORISATION_CODE: authorsationCode,
      }),
    });
  });


  it('Validate successful ASPSP AS authorisation and display consent approval page for account flow ', () => {
    const { authorise } = authoriseService;
    const query = Object.assign({}, refQuery);
    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/aaa-bank/authorize',
      query,
    });
    const res = httpMocks.createResponse();
    authorise(req, res);
    assert.ok(res._getData().includes('Welcome to the bank')); //eslint-disable-line
    assert.equal(res.statusCode, 200);
  });

  it('Validate successful ASPSP AS authorisation with approved consent for account flow ', () => {
    const { authorise } = authoriseService;
    const query = Object.assign({}, refQuery, { approve: 1 });
    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/aaa-bank/authorize',
      query,
    });
    const res = httpMocks.createResponse();
    authorise(req, res);
    assert.equal(res.statusCode, 302);
    const location = res._getRedirectUrl();  //eslint-disable-line
    assert.ok(location);
    assert.ok(location.startsWith(aspspCallbackRedirectionUrl));
    assert.ok(location.includes(`code=${authorsationCode}`));
    assert.ok(location.includes(`state=${state}`));
  });

  it('Validate successful ASPSP AS authorisation with approved consent for payment flow ', () => {
    const { authorise } = authoriseService;
    const query = Object.assign({}, refQuery, { scope: 'openid payments', approve: 1 });
    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/aaa-bank/authorize',
      query,
    });
    const res = httpMocks.createResponse();
    authorise(req, res);
    assert.equal(res.statusCode, 302);
    const location = res._getRedirectUrl();  //eslint-disable-line
    assert.ok(location);
    assert.ok(location.startsWith(aspspCallbackRedirectionUrl));
    assert.ok(location.includes(`code=${authorsationCode}`));
    assert.ok(location.includes(`state=${state}`));
  });

  it('Validate successful ASPSP AS authorisation with not approved consent for payment flow ', async () => {
    const { authorise } = authoriseService;
    const query = Object.assign({}, refQuery, { scope: 'openid payments', cancel: 1 });
    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/aaa-bank/authorize',
      query,
    });
    const res = httpMocks.createResponse();
    try {
      await authorise(req, res);
    } catch (e) {
      assert.equal(e.message, 'Redirection due to access_denied');
    }
  });
});
