const fs = require('fs');
const request = require('axios');

const error = require('debug')('error');
const log = require('debug')('log');

const fetchSwagger = async (swaggerPath, fileName) => {
  const swagger = swaggerPath;
  if (swagger.startsWith('https')) {
    log(`http get: ${swagger}`);
    const file = `./${fileName}`;
    fs.writeFileSync(file, '');

    try {
      const response = await request({
        url: swagger,
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });
      log(`response: ${response.status}`);
      if (response.status === 200) {
        const swaggerData = (response.data);
        const swaggerJson = JSON.stringify(swaggerData);
        fs.appendFileSync(file, swaggerJson);
        return file;
      }
      const msg = `Swagger file ${swagger} not retrieved: ${response.status}`;
      error(msg);
      throw new Error(msg);
    } catch (e) {
      const msg = `Swagger file ${swagger} not retrieved:`;
      error(msg);
      error(e);
      throw e;
    }
  } else if (swagger.endsWith('.json') && fs.existsSync(swagger)) {
    log(`Swagger FILE Found ${swagger}`);
    return swagger;
  } else {
    const err = `Swagger file ${swagger} in JSON format does not exist`;
    error(err);
    throw new Error(err);
  }
};

exports.fetchSwagger = fetchSwagger;
