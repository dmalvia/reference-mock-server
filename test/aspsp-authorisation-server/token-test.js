const assert = require('assert');
const request = require('supertest'); // eslint-disable-line
const { app } = require('../../lib/app');
const { credentials } = require('../../lib/aspsp-authorisation-server/token');

describe('createToken', () => {
  const accessToken = 'test-access-token';
  let validCredentials;

  before(() => {
    process.env.CLIENT_ID = 'test-id';
    process.env.CLIENT_SECRET = 'test-secret';
    process.env.ACCESS_TOKEN = accessToken;
    validCredentials = credentials(process.env.CLIENT_ID, process.env.CLIENT_SECRET);
  });

  after(() => {
    process.env.CLIENT_ID = null;
    process.env.CLIENT_SECRET = null;
  });

  const requestTokenForClientCredentials = (authCredentials, data) => {
    const body = data || {
      scope: 'accounts',
      grant_type: 'client_credentials',
    };
    let requestObj = request(app)
      .post('/abc/token')
      .set('Accept', 'application/json');
    if (authCredentials) {
      requestObj = requestObj.set('authorization', authCredentials);
    }
    return requestObj
      .set('content-type', 'application/x-www-form-urlencoded')
      .send(body);
  };

  const requestTokenForAuthorizationCode = (authCredentials, data) => {
    const body = data || {
      grant_type: 'authorization_code',
      redirect_uri: 'some-redirect-url',
      code: 'sample-authorization-code',
    };
    let requestObj = request(app)
      .post('/abc/token')
      .set('Accept', 'application/json');
    if (authCredentials) {
      requestObj = requestObj.set('authorization', authCredentials);
    }
    return requestObj
      .set('content-type', 'application/x-www-form-urlencoded')
      .send(body);
  };

  it('returns 401 when credentials invalid', async () => {
    const invalidCredentials = credentials('bad-id', 'bad-secret');
    const res = await requestTokenForClientCredentials(invalidCredentials);
    assert.equal(res.status, 401);
    assert.equal(res.headers['www-authenticate'], 'client_credentials');
    assert.deepEqual(res.body, {
      error: 'invalid_client',
    });
  });

  it('returns 400 when credentials not send', async () => {
    const res = await requestTokenForClientCredentials(null);
    assert.equal(res.status, 400);
    assert.deepEqual(res.body, {
      error: 'invalid_client',
      error_description: 'authorization missing from request headers',
    });
  });

  it('returns 400 when scope missing in client credentials flow', async () => {
    const res = await requestTokenForClientCredentials(validCredentials, { grant_type: 'client_credentials' });
    assert.equal(res.status, 400);
    assert.deepEqual(res.body, {
      error: 'invalid_request',
      error_description: 'scope missing from request body',
    });
  });

  it('returns 400 when authorization code is missing in authorization code flow', async () => {
    const res = await requestTokenForClientCredentials(validCredentials, { grant_type: 'authorization_code' });
    assert.equal(res.status, 400);
    assert.deepEqual(res.body, {
      error: 'invalid_request',
      error_description: 'authorisation code missing from request body',
    });
  });

  it('returns 400 when redirect uri is missing in authorization code flow', async () => {
    const res = await requestTokenForClientCredentials(validCredentials, { grant_type: 'authorization_code', code: '123' });
    assert.equal(res.status, 400);
    assert.deepEqual(res.body, {
      error: 'invalid_request',
      error_description: 'redirect uri missing from request body',
    });
  });

  it('returns access token payload for client credentials flow when credentials valid', async () => {
    const res = await requestTokenForClientCredentials(validCredentials);
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, {
      access_token: accessToken,
      expires_in: 3600,
      scope: 'accounts',
      token_type: 'bearer',
    });
  });

  it('sets Content-Type to application/json;charset=UTF-8 in client credentials flow', async () => {
    const res = await requestTokenForClientCredentials(validCredentials);
    assert.ok(res.headers['content-type']);
    assert.equal(res.headers['content-type'], 'application/json; charset=utf-8');
  });

  it('sets no-store in Cache-Control header in client credentials flow', async () => {
    const res = await requestTokenForClientCredentials(validCredentials);
    assert.ok(res.headers['cache-control']);
    assert.equal(res.headers['cache-control'], 'no-store');
  });

  it('sets no-store in Pragma header in client credentials flow', async () => {
    const res = await requestTokenForClientCredentials(validCredentials);
    assert.ok(res.headers.pragma);
    assert.equal(res.headers.pragma, 'no-store');
  });

  it('returns access token payload for authorization code flow when credentials valid', async () => {
    const res = await requestTokenForAuthorizationCode(validCredentials);
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, {
      access_token: accessToken,
      expires_in: 3600,
      token_type: 'bearer',
    });
  });

  it('sets Content-Type to application/json;charset=UTF-8 in authorization code flow', async () => {
    const res = await requestTokenForAuthorizationCode(validCredentials);
    assert.ok(res.headers['content-type']);
    assert.equal(res.headers['content-type'], 'application/json; charset=utf-8');
  });

  it('sets no-store in Cache-Control header in authorization code flow', async () => {
    const res = await requestTokenForAuthorizationCode(validCredentials);
    assert.ok(res.headers['cache-control']);
    assert.equal(res.headers['cache-control'], 'no-store');
  });

  it('sets no-store in Pragma header in authorization code flow', async () => {
    const res = await requestTokenForAuthorizationCode(validCredentials);
    assert.ok(res.headers.pragma);
    assert.equal(res.headers.pragma, 'no-store');
  });
});
