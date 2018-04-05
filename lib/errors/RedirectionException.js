
module.exports = class RedirectionException extends Error {
  constructor(redirectionUrl, queryParams = {}, ...params) {
    super(...params);

    Error.captureStackTrace(this, RedirectionException);
    this.redirectionUrl = redirectionUrl;
    this.queryParams = queryParams;
    this.message = `Redirection due to ${this.queryParams.error}`;
  }
};
