// Runtime server environment database.

const environments = {
  Local: {
    API_URL: 'http://localhost:1300/tpapi',
    UPLOAD_URL: 'http://localhost:1300/tpupload',
    DATA_URL: 'http://localhost:1300/tpdata',
    BLIP_URL: 'https://localhost:8443/api'
  },
  Development: {
    API_URL: 'https://dev-connect.sensotrend.fi/tpapi',
    UPLOAD_URL: 'https://dev-connect.sensotrend.fi/tpupload',
    DATA_URL: 'https://dev-connect.sensotrend.fi/tpdata',
    BLIP_URL: 'https://dev.sensotrend.fi/api'
  },
  Staging: {
    API_URL: 'https://test-connect.sensotrend.fi/tpapi',
    UPLOAD_URL: 'https://test-connect.sensotrend.fi/tpupload',
    DATA_URL: 'https://test-connect.sensotrend.fi/tpdata',
    BLIP_URL: 'https://test.sensotrend.fi/api'
  },
  Integration: {
    API_URL: 'https://test-connect.sensotrend.fi/tpapi',
    UPLOAD_URL: 'https://test-connect.sensotrend.fi/tpupload',
    DATA_URL: 'https://test-connect.sensotrend.fi/tpdata',
    BLIP_URL: 'https://test.sensotrend.fi/api'
  },
  Production: {
    API_URL: 'https://connect.sensotrend.fi/tpapi',
    UPLOAD_URL: 'https://connect.sensotrend.fi/tpupload',
    DATA_URL: 'https://connect.sensotrend.fi/tpdata',
    BLIP_URL: 'https://www.sensotrend.fi/api'
  }
};

module.exports = {
  environments,
};
