import { Platform, Alert, Linking } from 'react-native';
import { api } from './api';
import { useAuthStore } from '../store/useAuthStore';

// The only tier sold as an Apple/Google in-app purchase — a one-time
// unlock of app content. Cohort, VIP, and Alumni involve human-delivered
// services (live coaching, Zoom calls) and are sold via website checkout
// instead, outside Apple's 30% cut.
export const PRODUCT_IDS = {
  basic: 'fullversion', // ₱1,499 DIY — one-time unlock, real Apple IAP (App Store Connect ref: "full-version")
};

// TODO(Marvin): replace with the real checkout URLs once the website is built.
export const WEBSITE_CHECKOUT_URLS: Record<'cohort' | 'vip' | 'alumni', string> = {
  cohort: 'https://unstuck21.com/checkout/cohort',
  vip:    'https://unstuck21.com/checkout/vip',
  alumni: 'https://unstuck21.com/checkout/alumni',
};

// Opens the website checkout for tiers that are NOT sold via Apple IAP
// (cohort, vip, alumni). Tier upgrades for these happen server-side —
// via payment-processor webhook or manual admin grant — after checkout.
export async function openWebsiteCheckout(tier: 'cohort' | 'vip' | 'alumni') {
  const url = WEBSITE_CHECKOUT_URLS[tier];
  const canOpen = await Linking.canOpenURL(url);
  if (!canOpen) {
    Alert.alert('Unable to open checkout', 'Please try again later.');
    return;
  }
  await Linking.openURL(url);
}

// ── Mock IAP ──────────────────────────────────────────────────────────────────
// Set to true while the App Store product isn't live yet.
// Shows a realistic confirmation dialog and grants the tier locally (session only).
// Flip to false once the product is approved in App Store Connect.
export const MOCK_IAP = true;

const MOCK_PRICES: Record<string, string> = {
  basic: '₱1,499',
};

function mockPurchaseTier(productId: string): Promise<void> {
  const tierEntry = Object.entries(PRODUCT_IDS).find(([, id]) => id === productId);
  const tier  = (tierEntry?.[0] ?? 'basic') as 'basic';
  const price = MOCK_PRICES[tier] ?? '₱1,499';

  return new Promise((resolve, reject) => {
    Alert.alert(
      'Confirm Purchase',
      `${price} · One-time payment\n\n(Demo mode — no charge will be made.)`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => reject({ code: 'E_USER_CANCELLED' }) },
        {
          text: 'Buy',
          onPress: () => {
            const user = useAuthStore.getState().user;
            if (user) {
              useAuthStore.getState().updateUser({ ...user, tier });
            }
            Alert.alert('Purchase successful!', 'Your tier has been upgraded.');
            resolve();
          },
        },
      ],
    );
  });
}

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
        Alert.alert('Purchase successful!', 'Your tier has been upgraded.');
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

export async function restorePurchases() {
  const lib = await getIAP();
  if (!lib) throw new Error('Purchases unavailable in Expo Go');
  await lib.initConnection();
  const purchases = await lib.getAvailablePurchases();
  return purchases;
}

export async function purchaseTier(productId: string) {
  if (MOCK_IAP) {
    return mockPurchaseTier(productId);
  }
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
