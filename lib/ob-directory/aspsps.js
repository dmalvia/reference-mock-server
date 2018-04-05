const env = require('env-var');

const openId = env.get('OPENID_CONFIG_ENDPOINT_URL').asString();
const aspsp = (name, fcaId, id, fapiFinancialId, openIdConfigBase) => ({
  'urn:openbanking:competentauthorityclaims:1.0': {
    AuthorityId: 'FCA',
    MemberState: 'GB',
    RegistrationId: fcaId,
  },
  'AuthorisationServers': [{
    Id: id,
    AutoRegistrationSupported: true,
    BaseApiDNSUri: `${process.env.HOST}`,
    ClientRegistrationUri: 'string',
    CustomerFriendlyDescription: 'string',
    CustomerFriendlyLogoUri: '',
    CustomerFriendlyName: name,
    DeveloperPortalUri: 'string',
    OpenIDConfigEndPointUri: `${openIdConfigBase}/${id}`,
    PayloadSigningCertLocation: 'string',
    TermsOfService: 'string',
  }],
  'urn:openbanking:organisation:1.0': {
    OBOrganisationId: fapiFinancialId,
    OrganisationCommonName: name.replace(' Bank', ' PLC'),
  },
  'id': fapiFinancialId,
});

const OBAccountPaymentServiceProviders = (req, res) => {
  res.json({
    Resources: [
      aspsp('AAA Example Bank', '123', 'aaaj4NmBD8lQxmLh2O', 'aaax5nTR33811Qy', openId),
      aspsp('BBB Example Bank', '456', 'bbbX7tUB4fPIYB0k1m', 'bbbUB4fPIYB0k1m', openId),
      aspsp('CCC Example Bank', '789', 'cccbN8iAsMh74sOXhk', 'cccMh74sOXhkQfi', openId),
    ],
  });
};

exports.OBAccountPaymentServiceProviders = OBAccountPaymentServiceProviders;
