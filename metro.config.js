const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

/**
 * Expo Go stub list.
 *
 * These packages use NitroModules or other APIs that hard-crash Expo Go.
 * We redirect them to no-op mocks when not running an EAS build.
 *
 * NOTE: extraNodeModules is a FALLBACK — it only applies when Metro cannot
 * find the package in node_modules. Packages that exist in node_modules are
 * NOT overridden by extraNodeModules. We use resolveRequest instead, which
 * intercepts resolution before Metro touches node_modules.
 */
const isEasBuild = !!process.env.EAS_BUILD;

const EXPO_GO_STUBS = {
  'react-native-iap':           path.resolve(__dirname, 'mocks/react-native-iap.js'),
  'react-native-nitro-modules': path.resolve(__dirname, 'mocks/react-native-nitro-modules.js'),
  'expo-video':                 path.resolve(__dirname, 'mocks/expo-video.js'),
};

if (!isEasBuild) {
  const originalResolveRequest = config.resolver.resolveRequest;

  config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (EXPO_GO_STUBS[moduleName]) {
      return { filePath: EXPO_GO_STUBS[moduleName], type: 'sourceFile' };
    }
    if (originalResolveRequest) {
      return originalResolveRequest(context, moduleName, platform);
    }
    return context.resolveRequest(context, moduleName, platform);
  };
}

module.exports = config;
