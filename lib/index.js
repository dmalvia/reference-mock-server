const { Middleware } = require('swagger-express-middleware');
const { initializeMiddleware } = require('swagger-tools');
const { fetchSwagger } = require('./aspsp-resource-server/swagger');
const { accountRequests } = require('./aspsp-resource-server/account-requests');
const { paymentsMiddleware, paymentSubmissionsMiddleware } = require('./aspsp-resource-server');
const { app } = require('./app.js');
const dataSource = require('./aspsp-resource-server/datasource');
const error = require('debug')('error');

const { accountRequestMiddleware } = accountRequests;

const mockDataMiddleware = (req, res) => {
  dataSource.mockData(req, (data) => {
    if (!data) {
      res.sendStatus(404);
    } else {
      res.send(data);
    }
  });
};

const schemaValidationErrorMiddleware = (err, req, res, next) => { // eslint-disable-line
  if (err.code && err.code === 'SCHEMA_VALIDATION_FAILED') {
    const responseBuffer = err.originalResponse;
    const originalResponse = responseBuffer ? JSON.parse(responseBuffer.toString()) : '';
    const response = {
      message: 'Schema validation failed',
      errors: err.results.errors,
      originalResponse,
    };
    const message = JSON.stringify(response, null, ' ');
    error(message);
    res.status(500).send(message);
  } else {
    throw err;
  }
};

const accountSwagger = process.env.ACCOUNT_SWAGGER || process.env.SWAGGER; // eslint-disable-line
const paymentSwagger = process.env.PAYMENT_SWAGGER;

fetchSwagger(paymentSwagger, 'payment-swagger.json').then((paymentSwaggerFile) => {
  const swaggerObject = require(`../${paymentSwaggerFile}`); // eslint-disable-line
  initializeMiddleware(swaggerObject, (paymentToolsMiddleware) => {
    app.use(
      paymentToolsMiddleware.swaggerMetadata(),
      // Validate requests and responses against Swagger
      paymentToolsMiddleware.swaggerValidator({ validateResponse: true }),
    );
    app.use(paymentsMiddleware);
    app.use(paymentSubmissionsMiddleware);
  });
});

const initApp = (initFinished) => {
  dataSource.initResources(() => {
    fetchSwagger(accountSwagger, 'account-swagger.json').then((swaggerFile) => {
      const swaggerObject = require(`../${swaggerFile}`); // eslint-disable-line

      initializeMiddleware(swaggerObject, (toolsMiddleware) => { // init swagger-tools
        const middleware = new Middleware(app);

        middleware.init(swaggerFile, (err) => { // init swagger-express-middleware
          if (err) error(err);

          app.use(
            middleware.metadata(),
            middleware.CORS(),
            middleware.files(),
            middleware.parseRequest(),
          );
          app.use(
            toolsMiddleware.swaggerMetadata(),
            // Validate account requests and responses against Swagger
            toolsMiddleware.swaggerValidator({ validateResponse: true }),
          );

          app.use(accountRequestMiddleware);
          app.use(mockDataMiddleware);
          app.use(schemaValidationErrorMiddleware);

          initFinished(app);
        });
      });
    });
  });
};

exports.initApp = initApp;
