const error = require('debug')('error');

const errorType = (err) => {
  const ret = (!!err && !!err.constructor && !!err.constructor.name) ? err.constructor.name : 'Error';
  return ret;
};

const handler = (err, req, res, next) => { // eslint-disable-line
  const errClassName = errorType(err);
  try {
    switch (errClassName) {
      case 'ValidationException': {
        let response;
        if (err.payload) {
          response = err.payload;
          response.error_description = err.message;
        } else {
          response = err.message;
        }
        res.status(400).send(response);
        break;
      }
      case 'RedirectionException': {
        const entries = Object.entries(err.queryParams);
        const query = entries
          .map((q) => {
            const ret = `${q[0]}=${q[1]}`;
            return ret;
          })
          .reduce((comb, p) => {
            const ret = `${comb}&${p}`;
            return ret;
          });
        res.redirect(302, `${err.redirectionUrl}?${query}`);
        break;
      }
      case 'AuthenticationException': {
        const { headers, payload } = err;
        headers.forEach((name, value) => {
          res.set(value, name);
        });
        res.status(401).send(payload);
        break;
      }
      default:
        error(err);
        next(err);
    }
  } catch (unhandledError) {
    error(unhandledError);
    next(unhandledError);
  }
};

const logger = (err, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    error(`${errorType(err)} => ${err.stack}`);
  }
  next(err);
};

module.exports = {
  handler,
  logger,
};
