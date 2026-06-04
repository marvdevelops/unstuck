import { Platform, Alert } from 'react-native';
import { api } from './api';
import { useAuthStore } from '../store/useAuthStore';

// Must match product IDs in App Store Connect / Google Play Console
export const PRODUCT_IDS = {
  basic:  'unstuck21_basic',   // ₱1,499 DIY
  cohort: 'unstuck21_cohort',  // ₱7,499 Live Cohort
  vip:    'unstuck21_vip',     // ₱13,999 VIP Breakthrough
  alumni: 'unstuck21_alumni',  // ₱749 alumni re-entry
};

// Lazy-load react-native-iap so Expo Go doesn't crash on startup
// (react-native-iap requires a native build — not available in Expo Go)
let iap: typeof import('react-native-iap') | null = null;
async function getIAP() {
  if (iap) return iap;
  try {
    iap = await import('react-native-iap');
    return iap;
  } catch {
    return null;
  }
}

let purchaseUpdateSub: { remove: () => void } | null = null;
let purchaseErrorSub: { remove: () => void } | null = null;

export async function setupIAP() {
  const lib = await getIAP();
  if (!lib) {
    console.log('IAP: react-native-iap not available (Expo Go). Purchases disabled.');
    return;
  }
  try {
    await lib.initConnection();

    purchaseUpdateSub = lib.purchaseUpdatedListener(async (purchase) => {
      try {
        const platform = Platform.OS as 'ios' | 'android';
        let receipt: string;
        if (platform === 'ios') {
          receipt = await lib.getReceiptIOS();
        } else {
          receipt = (purchase as any).purchaseToken ?? purchase.transactionId ?? '';
        }

        if (!receipt) {
          console.warn('IAP: no receipt for', purchase.productId);
          return;
        }

        const { user } = await api.iap.verify(platform, receipt, purchase.productId);
        useAuthStore.getState().updateUser(user);
        await lib.finishTransaction({ purchase, isConsumable: false });
        Alert.alert('Purchase successful! 🎉', 'Your tier has been upgraded.');
      } catch (err: any) {
        Alert.alert('Verification failed', err.message ?? 'Please contact support.');
      }
    });

    purchaseErrorSub = lib.purchaseErrorListener((error) => {
      if (error.code !== lib!.ErrorCode.UserCancelled) {
        Alert.alert('Purchase error', error.message);
      }
    });
  } catch (err) {
    console.warn('IAP setup failed:', err);
  }
}

export function teardownIAP() {
  purchaseUpdateSub?.remove();
  purchaseErrorSub?.remove();
  getIAP().then((lib) => lib?.endConnection());
}

export async function loadProducts() {
  const lib = await getIAP();
  if (!lib) return [];
  return lib.fetchProducts({ skus: Object.values(PRODUCT_IDS) });
}

export async function purchaseTier(productId: string) {
  const lib = await getIAP();
  if (!lib) {
    Alert.alert('Purchases unavailable', 'Please install the full app to make purchases.');
    return;
  }
  await lib.requestPurchase({
    request: {
      apple: { sku: productId },
      google: { skus: [productId] },
    },
    type: 'in-app',
  });
}
