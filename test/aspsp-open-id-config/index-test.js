const assert = require('assert');
const request = require('supertest'); // eslint-disable-line
const proxyquire = require('proxyquire');
const env = require('env-var');

const host = 'http://localhost';

describe('/openid/config/:id', () => {
  let oid;
  let server;

  before(() => {
    oid = proxyquire('../../lib/aspsp-open-id-config', {
      'env-var': env.mock({
        OPENID_ASPSP_AUTH_HOST: host,
      }),
    });

    server = proxyquire('../../lib/app.js', {
      './aspsp-open-id-config': oid,
    });
  });

  it('returns JSON payload', (done) => {
    const apspsId = 'test-bank';
    request(server.app)
      .get(`/openid/config/${apspsId}`)
      .set('Accept', 'application/json')
      .end((err, res) => {
        const oidConfig = res.body;
        assert.equal(res.status, 200);
        assert.equal(oidConfig.authorization_endpoint, `${host}/${apspsId}/authorize`);
        assert.equal(oidConfig.token_endpoint, `${host}/${apspsId}/token`);
        assert.deepEqual(oidConfig.scopes_supported, ['openid', 'accounts', 'payments']);
        assert.deepEqual(oidConfig.id_token_signing_alg_values_supported, ['none']);
        assert.deepEqual(oidConfig.request_object_signing_alg_values_supported, ['none']);
        done();
      });
  });
});
