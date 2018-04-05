/* eslint import/no-extraneous-dependencies: off */
const assert = require('assert');
const sinon = require('sinon');
const swagger = require('../../lib/aspsp-resource-server/swagger');
const fs = require('fs');

const sandbox = sinon.createSandbox();
const nock = require('nock');

describe('fetchSwagger', () => {
  const uri = 'https://example.com/path';

  describe('when swagger path contains URI', () => {
    before(() => {
      sandbox.restore();
    });

    nock(/example\.com/)
      .get('/path')
      .reply(200, {});

    it('does HTTP GET of URI', async () => {
      const file = await swagger.fetchSwagger(uri, 'account-swagger.json');
      assert.equal(file, './account-swagger.json');
    });
  });

  describe('when swagger path does not contain URI', () => {
    const file = './path/swagger.json';

    before(() => {
      sandbox.restore();
      try {
        sandbox.stub(fs, 'existsSync').returns(true);
      } catch (e) {
        // ignore, due to error raised when running npm run test:watch
      }
    });

    it('checks env is a file that exists', async () => {
      const result = await swagger.fetchSwagger(file);
      assert(result, file);
      assert(fs.existsSync.calledWithMatch(file));
    });
  });
});
