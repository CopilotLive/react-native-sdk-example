const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');
const fs = require('fs');

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
    // Prioritize example app's node_modules first to ensure single React instance
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(sdkRoot, 'node_modules'),
    ],
    extraNodeModules: {
      'kaily-react-native-sdk': sdkRoot,
      // Force React and React Native to always resolve from the example app's node_modules
      // This prevents multiple React instances when the SDK has React in its node_modules
      'react': path.resolve(projectRoot, 'node_modules/react'),
      'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
    },
    // Custom resolver to use source files directly for the SDK
    resolveRequest: (context, moduleName, platform) => {
      // If resolving the SDK package, prefer source files over compiled lib files
      if (moduleName === 'kaily-react-native-sdk') {
        // Try to resolve to source index.ts first (for development)
        const sourceIndex = path.resolve(sdkRoot, 'index.ts');
        if (fs.existsSync(sourceIndex)) {
          return {
            filePath: sourceIndex,
            type: 'sourceFile',
          };
        }
        // Fallback to compiled lib/index.js
        const libIndex = path.resolve(sdkRoot, 'lib', 'index.js');
        if (fs.existsSync(libIndex)) {
          return {
            filePath: libIndex,
            type: 'sourceFile',
          };
        }
      }
      
      // For sub-paths like 'kaily-react-native-sdk/something', resolve normally
      // Default resolution for other modules
      return context.resolveRequest(context, moduleName, platform);
    },
    // Block resolving React from SDK's node_modules to prevent conflicts
    blockList: [
      new RegExp(`${sdkRoot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/node_modules/react/.*`),
      new RegExp(`${sdkRoot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/node_modules/react-native/.*`),
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
