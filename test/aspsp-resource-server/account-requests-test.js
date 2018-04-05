const assert = require('assert');
const { accountRequestHelper } = require('../../lib/aspsp-resource-server/account-request.js');

describe('Account Request', () => {
  it('Has a checkAuthorization Method', () => {
    const { checkAuthorization } = accountRequestHelper;
    assert.equal('function', typeof checkAuthorization);
  });

  it('Has a getCachedAccountRequest Method', () => {
    const { getCachedAccountRequest } = accountRequestHelper;
    assert.equal('function', typeof getCachedAccountRequest);
  });

  it('Has a makeAccountRequestId Method which returns a guid', () => {
    const { makeAccountRequestId } = accountRequestHelper;
    const accountRequestId = makeAccountRequestId();
    assert.equal(36, accountRequestId.length);
  });

  it('Has setCachedAccountRequest and getCachedAccountRequest Methods which cache account requests', () => {
    const {
      setCachedAccountRequest,
      getCachedAccountRequest,
      makeAccountRequestId,
    } = accountRequestHelper;

    const accountRequestId = makeAccountRequestId();
    const accountRequestObject = { accountRequestId };
    setCachedAccountRequest(accountRequestId, accountRequestObject);
    const cachedObj = getCachedAccountRequest(accountRequestId);
    assert.equal(accountRequestId, cachedObj.accountRequestId);
  });

  describe('Building Responses', () => {
    it('Returns false from a cache miss GET request', () => {
      const { buildGetResponse } = accountRequestHelper;
      const getResp = buildGetResponse('foo');
      assert.equal(false, getResp);
    });

    it('Builds a POST response, caches it, and returns a cached response with a GET request', () => {
      const {
        buildPostResponse,
        buildGetResponse,
        setCachedAccountRequest,
        makeAccountRequestId,
      } = accountRequestHelper;

      const requestData = {
        Permissions: [],
      };

      const accountRequestId = makeAccountRequestId();
      const accountRequestObject = buildPostResponse(accountRequestId, requestData);
      setCachedAccountRequest(accountRequestId, accountRequestObject);
      const getResp = buildGetResponse(accountRequestId);
      assert.equal(getResp.Data.AccountRequestId, accountRequestId);
    });

    it('Builds a POST response, checks status,' +
      ' caches it, checks status of GET, DELETES it and returns a cache miss, \n' +
      'DELETE returns true for a deleted object, false for a missing object', () => {
      const {
        buildPostResponse,
        buildGetResponse,
        setCachedAccountRequest,
        makeAccountRequestId,
        deleteCachedAccountRequest,
        updateAccountRequestToAuthorised,
      } = accountRequestHelper;

      const requestData = {
        Permissions: [],
      };

      const accountRequestId = makeAccountRequestId();
      const accountRequestObject = buildPostResponse(accountRequestId, requestData);
      assert.equal(accountRequestObject.Data.Status, 'AwaitingAuthorisation');
      setCachedAccountRequest(accountRequestId, accountRequestObject);
      const getResp1 = buildGetResponse(accountRequestId);
      assert.equal(getResp1.Data.AccountRequestId, accountRequestId);
      assert.equal(getResp1.Data.Status, 'AwaitingAuthorisation');
      updateAccountRequestToAuthorised(accountRequestId);
      const getResp2 = buildGetResponse(accountRequestId);
      assert.equal(getResp2.Data.Status, 'Authorised');
      const firstTry = deleteCachedAccountRequest(accountRequestId);
      const secondTry = deleteCachedAccountRequest(accountRequestId);
      const emptyResp = buildGetResponse(accountRequestId);
      assert.equal(emptyResp, false);
      assert.equal(firstTry, true);
      assert.equal(secondTry, false);
    });
  });
});
