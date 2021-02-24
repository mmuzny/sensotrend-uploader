/* eslint-disable lodash/prefer-lodash-method */
const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
const process = require('process');

const STORE_FILE = '.run-with-version.json';

function runGit(args) {
  const gitResult = child_process.spawnSync('git', args, {
    shell: true,
    stdio: [
      'ignore',
      'pipe',
      'inherit',
    ],
    timeout: 2000,
  });
  if (gitResult.status !== 0 || gitResult.error) {
    const [cmd] = args;
    throw new Error(
      `git ${cmd} failed: ${gitResult.error || gitResult.status}`);
  }
  return gitResult;
}

function resolveBranch() {
  const result = runGit(['branch', '--show-current']);
  return result.stdout.toString().trim();
}

function resolveVersion() {
  const result = runGit(['describe', '--tags']);

  const tagStdout = result.stdout.toString().trim();
  const tagPattern = /^(.+?)(-\w+?)?(-\d+-g\w+)?$/;
  const tagDetails = tagPattern.exec(tagStdout);
  if (tagDetails === null) {
    throw new Error('Couldn\'t parse tag: ' + tagStdout);
  }

  let channel;
  let logSuffix = '';
  let numCommits = 0;
  let nonTagCommitHash = '';
  let branch = '';
  if (tagDetails[3]) {
    const s = tagDetails[3].substring(1).split('-');
    numCommits = Number.parseInt(s[0]);
    nonTagCommitHash = s[1].substring(1);
    channel = 'snapshot';
    branch = resolveBranch();
    logSuffix = `, commits=${numCommits} hash=${nonTagCommitHash}` +
      ` branch=${branch}`;
  } else if (tagDetails[2]) {
    channel = tagDetails[2].substring(1);
  } else {
    channel = 'unknown';
  }

  const tagVersion = tagDetails[1].trim();
  console.info(' * Found tag version=' + tagVersion +
    ', channel=' + channel + logSuffix);

  return {
    channel,
    tagVersion,
    numCommits,
    nonTagCommitHash,
    branch,
  };
}

function withPkgJson(fileName, fn) {
  const fileData = fs.readFileSync(fileName, { encoding: 'utf-8' });
  const json = JSON.parse(fileData);

  fn(json);

  const patchedData = JSON.stringify(json, null, 2);
  const file = fs.openSync(fileName, 'w');
  fs.writeSync(file, patchedData, null, 'utf-8');
  fs.writeSync(file, '\n', null, 'utf-8');
  fs.closeSync(file);
}

function setVersion(fileName, versionString, extra) {
  withPkgJson(fileName, (json) => {
    json['version'] = versionString;
    if (extra) {
      extra(json);
    }
  });
}

function removeVersion(fileName, extra) {
  withPkgJson(fileName, (json) => {
    delete json['version'];
    if (extra) {
      extra(json);
    }
  });
}

function restoreEnv() {
  if (!fs.existsSync(STORE_FILE)) {
    console.error(`${STORE_FILE} not found. Nothing to restore?`);
    process.exit(1);
  }
  const store = JSON.parse(
    fs.readFileSync(STORE_FILE, { encoding: 'utf-8' }));

  removeVersion('package.json', (json) => {
    json.name = store.name;
    json.description = store.description;
    delete json['build'];
  });
  removeVersion('app/package.json', (json) => {
    json.name = store.name;
    json.description = store.description;
  });

  fs.unlinkSync(STORE_FILE);
}

function patchEnv() {
  if (fs.existsSync(STORE_FILE)) {
    console.error(`${STORE_FILE} already exists. --restore first.`);
    console.info('Running yarn env-finish should do that.');
    process.exit(1);
  }

  const versionInfo = resolveVersion();
  const packageFileData = fs.readFileSync(
    'package.json', { encoding: 'utf-8' });
  const originalPackage = JSON.parse(packageFileData);

  let version;
  let appId = 'org.sensotrend.SensotrendUploader';
  let name;
  let description;
  if (versionInfo.numCommits) {
    // Development commit: a.b.c-branch-commits-hash
    version = [
      versionInfo.tagVersion,
      versionInfo.branch,
      versionInfo.numCommits,
      versionInfo.nonTagCommitHash,
    ].join('-');
    appId += '.dev';
    name = originalPackage.name + '-dev';
    description = originalPackage.description + ' DEV';
  } else if (versionInfo.channel === 'production') {
    // Marked tag, production.
    version = versionInfo.tagVersion;
    name = originalPackage.name;
    description = originalPackage.description;
  } else {
    // Marked tag, pre-release.
    version = `${versionInfo.tagVersion}-${versionInfo.channel}`;
    appId += '.' + originalPackage.channel;
    name = originalPackage.name + '-' + versionInfo.channel;
    description = originalPackage.description
      + ' ' + versionInfo.channel.toUpperCase();
  }

  setVersion('package.json', version, (json) => {
    json.name = name;
    json.description = description;
    json.build = {
      appId: appId,
      productName: description,
    };
  });

  setVersion('app/package.json', version, (json) => {
    json.name = name;
    json.description = description;
  });

  const store = JSON.stringify({
    name: originalPackage.name,
    description: originalPackage.description,
  });
  fs.writeFileSync(STORE_FILE, store, { encoding: 'utf-8' });
}

function main() {
  const self = path.basename(__filename);

  const argStart = process.argv.findIndex((e) => e.indexOf(self) >= 0);
  const args = process.argv.slice(argStart + 1);
  if (args.find((e) => e === '--help')) {
    console.log('usage:');
    console.log(`  ${self} [--restore]`);
    console.log('Patches package.json files so that they contain correct');
    console.log('version, name, description and other information for');
    console.log('running build, package or the app.');
    console.log('NOTE: Patched package.json files should not be committed!');
    console.log(`Run  ${self} --restore  before committing.`);
    process.exit(0);
  }

  if (args.find((e) => e === '--restore')) {
    restoreEnv();
  } else {
    patchEnv();
  }
}

if (require.main === module) {
  main();
} else {
  module.exports = {
    resolveVersion,
  };
}
