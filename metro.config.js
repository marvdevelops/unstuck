const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// In Expo Go, redirect react-native-iap to a no-op stub.
// react-native-iap uses NitroModules which require a native build.
// Remove this override when building with EAS / expo prebuild.
const isExpoGo = process.env.EXPO_PUBLIC_USE_STUB_IAP === 'true' || !process.env.EAS_BUILD;

if (isExpoGo) {
  config.resolver.extraNodeModules = {
    ...config.resolver.extraNodeModules,
    'react-native-iap': path.resolve(__dirname, 'mocks/react-native-iap.js'),
  };
}

module.exports = config;
