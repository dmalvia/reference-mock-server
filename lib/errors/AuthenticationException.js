module.exports = class AuthenticationException extends Error {
  constructor(...params) {
    super(...params);

    Error.captureStackTrace(this, AuthenticationException);
    this.h = new Map();
    this.p = null;
  }

  addHeader(key, value) {
    this.h.set(key, value);
    return this;
  }

  get headers() {
    return this.h;
  }

  get payload() {
    return this.p;
  }

  addPayload(p) {
    this.p = p;
    return this;
  }
};
