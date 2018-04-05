if (!process.env.DEBUG) process.env.DEBUG = 'error,log';

const port = (process.env.PORT || 8001);
const log = require('debug')('log');
const { initApp } = require('./lib');

initApp((app) => {
  app.listen(port, () => {
    log(`running on localhost:${port} ... `);
  });
});
