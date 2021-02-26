// Build-time configuration for server environments.

const process = require('process');

const ENVIRONMENTS = {
  local: {
    /**
     * Default runtime environment name.
     * Key from environments.js environments object.
     */
    defaultEnv: 'Local',
    /** URL for update source. */
    updateURL: null,
  },
  dev: {
    defaultEnv: 'Development',
    updateURL: 'https://dev.sensotrend.fi/download/uploader/update/${os}/',
  },
  staging: {
    defaultEnv: 'Staging',
    updateURL: 'https://test.sensotrend.fi/download/uploader/update/${os}/',
  },
  integration: {
    defaultEnv: 'Integration',
    updateURL: 'https://test.sensotrend.fi/download/uploader/update/${os}/',
  },
  production: {
    defaultEnv: 'Production',
    updateURL: 'https://www.sensotrend.fi/download/uploader/update/${os}/'
  },
};

/** Default build-time environment name to use. */
const DEFAULT_ENV = 'dev';

const environment = process.env['ENVIRONMENT'] || DEFAULT_ENV;
const envConfig = ENVIRONMENTS[environment];

module.exports = {
  ENVIRONMENTS,
  environment,
  envConfig,
};
