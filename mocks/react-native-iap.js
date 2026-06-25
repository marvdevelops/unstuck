// Stub for Expo Go — react-native-iap requires NitroModules (native build only).
// All functions are no-ops so the app loads without crashing.
const noop = () => {};
const noopAsync = async () => {};
const noopListener = () => ({ remove: noop });

module.exports = {
  initConnection: noopAsync,
  endConnection: noopAsync,
  fetchProducts: async () => [],
  getAvailablePurchases: async () => [],
  requestPurchase: noopAsync,
  finishTransaction: noopAsync,
  getReceiptIOS: async () => '',
  purchaseUpdatedListener: noopListener,
  purchaseErrorListener: noopListener,
  ErrorCode: {
    UserCancelled: 'E_USER_CANCELLED',
  },
};
