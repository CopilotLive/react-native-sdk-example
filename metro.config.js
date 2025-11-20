const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */

const projectRoot = __dirname;
const sdkRoot = path.resolve(projectRoot, '..');

const config = {
  projectRoot,
  watchFolders: [sdkRoot],
  resolver: {
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(sdkRoot, 'node_modules'),
    ],
    extraNodeModules: {
      'kaily-react-native-sdk': sdkRoot,
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
