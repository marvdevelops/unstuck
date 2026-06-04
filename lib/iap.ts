import { Platform, Alert } from 'react-native';
import {
  initConnection,
  endConnection,
  fetchProducts,
  requestPurchase,
  purchaseUpdatedListener,
  purchaseErrorListener,
  finishTransaction,
  getReceiptIOS,
  ErrorCode,
} from 'react-native-iap';
import { api } from './api';
import { useAuthStore } from '../store/useAuthStore';

// Must match product IDs in App Store Connect / Google Play Console
export const PRODUCT_IDS = {
  basic:  'unstuck21_basic',   // ₱1,499 DIY
  cohort: 'unstuck21_cohort',  // ₱7,499 Live Cohort
  vip:    'unstuck21_vip',     // ₱13,999 VIP Breakthrough
  alumni: 'unstuck21_alumni',  // ₱749 alumni re-entry
};

let purchaseUpdateSub: ReturnType<typeof purchaseUpdatedListener> | null = null;
let purchaseErrorSub: ReturnType<typeof purchaseErrorListener> | null = null;

export async function setupIAP() {
  try {
    await initConnection();

    purchaseUpdateSub = purchaseUpdatedListener(async (purchase) => {
      try {
        const platform = Platform.OS as 'ios' | 'android';

        let receipt: string;
        if (platform === 'ios') {
          receipt = await getReceiptIOS();
        } else {
          receipt = (purchase as any).purchaseToken ?? purchase.transactionId ?? '';
        }

        if (!receipt) {
          console.warn('IAP: no receipt for', purchase.productId);
          return;
        }

        const { user } = await api.iap.verify(platform, receipt, purchase.productId);
        useAuthStore.getState().updateUser(user);
        await finishTransaction({ purchase, isConsumable: false });
        Alert.alert('Purchase successful! 🎉', 'Your tier has been upgraded.');
      } catch (err: any) {
        Alert.alert('Verification failed', err.message ?? 'Please contact support.');
      }
    });

    purchaseErrorSub = purchaseErrorListener((error) => {
      if (error.code !== ErrorCode.UserCancelled) {
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
  endConnection();
}

export async function loadProducts() {
  return fetchProducts({ skus: Object.values(PRODUCT_IDS) });
}

export async function purchaseTier(productId: string) {
  await requestPurchase({
    request: {
      apple: { sku: productId },
      google: { skus: [productId] },
    },
    type: 'in-app',
  });
}
