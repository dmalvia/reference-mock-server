module.exports = class ValidationException extends Error {
  constructor(...params) {
    super(...params);

    Error.captureStackTrace(this, ValidationException);
    this.p = null;
  }

  get payload() {
    return this.p;
  }

  setPayload(p) {
    this.p = p;
    return this;
  }
};
