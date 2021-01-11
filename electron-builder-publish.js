const child_process = require('child_process');

const config = {
  publish: [
      'github'
  ],
  productName: 'Sensotrend Uploader',
  appId: 'org.sensotrend.SensotrendUploader',
  directories: {
    buildResources: 'resources',
    output: 'release'
  },
  afterSign: 'scripts/notarize.js',
  dmg: {
    contents: [
      {
        x: 381,
        y: 190,
        type: 'link',
        path: '/Applications'
      },
      {
        x: 159,
        y: 190,
        type: 'file'
      }
    ],
    background: 'resources/background.tiff'
  },
  nsis: {
    oneClick: false,
    perMachine: true,
    allowElevation: true
  },
  files: [
    'dist/',
    'node_modules/',
    'resources/',
    'app.html',
    'about.html',
    'main.prod.js',
    'main.prod.js.map',
    'package.json'
  ],
  extraResources: [
    {
      from: 'resources/${os}',
      to: 'driver/',
      filter: [
        '**/*',
        '!*.md'
      ]
    },
    'sounds/',
    'locales/'
  ],
  win: {
    target: [
      {
        target: 'nsis',
        arch: [
          'ia32',
          'x64'
        ]
      },
      {
        target: 'zip',
        arch: [
          'ia32',
          'x64'
        ]
      }
    ],
    publisherName: [
      'Sensotrend Oy'
    ],
    rfc3161TimeStampServer: 'http://timestamp.digicert.com'
  },
  mac: {
    category: 'public.app-category.tools',
    entitlements: 'resources/mac/entitlements.mac.plist',
    entitlementsInherit: 'resources/mac/entitlements.mac.plist',
    target: [
      {
        target: 'zip',
        arch: [
          'x64'
        ]
      },
      {
        target: 'dmg',
        arch: [
          'x64'
        ]
      },
      'dir'
    ]
  },
  linux: {
    target: ['AppImage'],
    category: 'Utility',
  }
};

function resolveReleaseType() {
  const gitResult = child_process.spawnSync('git', ['describe', '--tags'], {
    shell: true,
    stdio: [
      'ignore',
      'pipe',
      'inherit',
    ],
    timeout: 2000,
  });
  if (gitResult.status !== 0 || gitResult.error) {
    throw new Error('git describe failed: ' +
      (gitResult.error || gitResult.status));
  }

  const tagStdout = gitResult.stdout.toString().trim();
  const tagPattern = /^(.+?)(-\w+?)?(-\d+-g\w+)?$/;
  const tagDetails = tagPattern.exec(tagStdout);
  if (tagDetails === null) {
    throw new Error('Couldn\'t parse tag: ' + tagStdout);
  }

  let channel;
  let logSuffix = '';
  if (tagDetails[3]) {
    channel = 'snapshot';
    logSuffix = ', detail=' + tagDetails[3].substring(1);
  } else if (tagDetails[2]) {
    channel = tagDetails[2].substring(1);
  } else {
    channel = 'unknown';
  }

  const tagVersion = tagDetails[1].trim();
  console.info(' * Release: tag version=' + tagVersion +
    ', channel=' + channel + logSuffix);

  const pkg = require('./package.json');
  if (channel !== 'snapshot') {
    if (pkg.version !== tagVersion) {
      throw new Error(' ** Package.json and tag version differ: '
        + pkg.version + ' != ' + tagVersion);
    }
  } else if (pkg.version.indexOf('snapshot') === -1) {
    throw new Error(' ** Package.json version must contain' +
      ' text "snapshot" for snapshot packaging.');
  }
  return channel;
}

const channel = resolveReleaseType();

if (channel !== 'unknown') {
  config.publish = [
    {
      provider: 'generic',
      url: 'https://www.sensotrend.fi/download/uploader/update/${os}/',
      channel: channel,
    },
  ];
}

module.exports = config;
