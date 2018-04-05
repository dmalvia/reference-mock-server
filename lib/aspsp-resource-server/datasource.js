const { MemoryDataStore, Resource } = require('swagger-express-middleware');
const fs = require('fs');
const error = require('debug')('error');
const log = require('debug')('log');

const memStore = new MemoryDataStore();

const loadResource = (file) => {
  if (!file.endsWith('.json')) {
    return null;
  }
  const path = file.replace('./data', '').replace('.json', '');
  const json = fs.readFileSync(file, 'utf8');
  const data = JSON.parse(json);
  return new Resource(path, data);
};

const loadResources = (dir) => {
  let resources = [];
  fs.readdirSync(dir).forEach((path) => {
    const fullPath = `${dir}/${path}`;
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      resources = resources.concat(loadResources(fullPath));
    } else {
      const resource = loadResource(fullPath);
      if (resource) {
        resources.push(resource);
      }
    }
  });
  return resources;
};

const initResources = (done) => {
  const resources = loadResources('./data');
  memStore.save(resources, (err) => {
    if (err) error(err);
    done();
  });
};

const dataPath = (req) => {
  const version = process.env.VERSION || 'v1.1';
  const authorization = process.env.USER_DATA_DIRECTORY; // eslint-disable-line
  const financialId = process.env.BANK_DATA_DIRECTORY;
  const filePath = `/${financialId}/${authorization}`;
  log(' In dataPath headers is ');
  log(req.headers);
  return req.path.replace(`/open-banking/${version}`, filePath);
};

const mockData = (req, done) => {
  const path = dataPath(req);
  memStore.get(path, (err, resource) => {
    if (err || !resource || !resource.data) {
      done(null);
    } else {
      done(resource.data);
    }
  });
};

exports.initResources = initResources;
exports.mockData = mockData;
