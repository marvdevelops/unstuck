/**
 * No-op stub for react-native-nitro-modules in Expo Go.
 * NitroModules requires a custom native build — it cannot run in Expo Go.
 * This stub satisfies any imports without crashing.
 */
'use strict';

const noop = () => {};
const noopAsync = () => Promise.resolve();

// Stub the main NitroModules proxy object
const NitroModulesStub = new Proxy(
  {},
  {
    get: (_, prop) => {
      if (prop === 'version') return '0.0.0';
      // Return a no-op function for any method call
      return () => null;
    },
  }
);

module.exports = {
  NitroModules: NitroModulesStub,
  isRuntimeAlive: () => false,
  // Common exports that react-native-iap and others may reference
  HybridObject: class HybridObject {},
  AnyMap: class AnyMap {},
};
