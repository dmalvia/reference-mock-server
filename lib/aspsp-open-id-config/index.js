const env = require('env-var');
const log = require('debug')('log');

const openidAspspAuthHost = env.get('OPENID_ASPSP_AUTH_HOST').asString();
const openidAspspTokenHost = env.get('OPENID_ASPSP_TOKEN_HOST').asString();

const get = (req, res) => {
  const aspspId = req.params.id;
  log(`http get open id config for aspsp: [${aspspId}]`);

  res.json({
    authorization_endpoint: `${openidAspspAuthHost}/${aspspId}/authorize`,
    token_endpoint: `${openidAspspTokenHost || openidAspspAuthHost}/${aspspId}/token`,
    scopes_supported: ['openid', 'accounts', 'payments'],
    id_token_signing_alg_values_supported: ['none'],
    request_object_signing_alg_values_supported: ['none'],
  });
};

exports.openIdConfig = { get };
