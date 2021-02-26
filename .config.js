/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2014, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */

const environments = require('./lib/environments');

function stringToBoolean(str, defaultValue) {
  if (str === 'true') {
    return true;
  }
  if (str === 'false') {
    return false;
  }
  return defaultValue || false;
}

function stringToArray(str, defaultValue) {
  if (!(str && str.length)) {
    return defaultValue;
  }
  return str.split(',');
}

function resolveEnvironment() {
  // Resolve addresses for services from default values and overrides.
  // - By default, use environment that should be used (declared by build).
  // - If UPLOADER_ENVIRONMENT is set, use that name as default.
  // - If any of the URL:s are also set, let the initial environment
  //   be "Custom".

  const envOverride = process.env.UPLOADER_ENVIRONMENT;
  let baseEnvName;
  if (envOverride && environments.environments[envOverride]) {
    baseEnvName = envOverride;
  } else {
    if (envOverride) {
      console.warn(`Environment ${envOverride} not found.`);
    }
    baseEnvName = environments.defaultKey;
  }
  const baseEnv = environments.environments[baseEnvName];

  function getEnvValue(name) {
    if (process.env[name]) {
      return process.env[name];
    } else {
      return baseEnv[name];
    }
  }

  const hasOverrides = [
    'API_URL',
    'UPLOAD_URL',
    'DATA_URL',
    'BLIP_URL',
  ].reduce((prev, e) => prev || !!process.env[e], false)

  const env = {
    ENVIRONMENT: hasOverrides ? 'Custom' : baseEnvName,
    API_URL: getEnvValue('API_URL'),
    UPLOAD_URL: getEnvValue('UPLOAD_URL'),
    DATA_URL: getEnvValue('DATA_URL'),
    BLIP_URL: getEnvValue('BLIP_URL'),
  };

  if (hasOverrides) {
    // Store the env settings to Custom entry so that it doesn't
    // pollute original definitions and is returnable if the env
    // choice is changed while running.
    environments.environments.Custom = env;
  }
  return env;
}

const defaultEnv = resolveEnvironment();

module.exports = {
  // this is to always have the Bows logger turned on!
  // NB: it is distinct from our own "debug mode"
  DEBUG: stringToBoolean(process.env.DEBUG, true),
  // the defaults for these need to be pointing to prod
  ENVIRONMENT: defaultEnv.ENVIRONMENT,
  API_URL: defaultEnv.API_URL,
  UPLOAD_URL: defaultEnv.UPLOAD_URL,
  DATA_URL: defaultEnv.DATA_URL,
  BLIP_URL: defaultEnv.BLIP_URL,
  DEFAULT_TIMEZONE: process.env.DEFAULT_TIMEZONE || 'Europe/Helsinki',
  DEFAULT_CARELINK_DAYS: process.env.DEFAULT_CARELINK_DAYS || '180'
};
