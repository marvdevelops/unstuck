import { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Colors } from '../../constants/colors';
import { Fonts, FontSizes } from '../../constants/typography';
import { Spacing, Radius, Shadows } from '../../constants/spacing';
import { purchaseTier, PRODUCT_IDS } from '../../lib/iap';
import { useAuthStore } from '../../store/useAuthStore';

interface UpsellConfig {
  tier: 'basic' | 'cohort' | 'vip';
  headline: string;
  subheadline: string;
  bullets: string[];
  price: string;
  cta: string;
  accent: string;
}

const UPSELL_CONFIGS: Record<string, UpsellConfig> = {
  basic: {
    tier: 'basic',
    headline: 'Keep Your Momentum',
    subheadline: "You've proved you can start. Now let's make sure you finish.",
    bullets: [
      '21 days of guided neuroscience content',
      'Lifetime access — revisit any day',
      'All 6 unstuck tools unlocked',
      'Your full Limitless Toolkit',
    ],
    price: '₱1,499',
    cta: 'Unlock All 21 Days',
    accent: Colors.primaryBlue,
  },
  cohort: {
    tier: 'cohort',
    headline: "You Don't Have to Do This Alone",
    subheadline: 'People who change together, stay changed.',
    bullets: [
      'Everything in Basic',
      'Live Zoom calls with Coach Erik',
      'Private accountability group access',
      'Weekly group coaching sessions',
    ],
    price: '₱7,499',
    cta: 'Join the Live Cohort',
    accent: Colors.successGreen,
  },
  vip: {
    tier: 'vip',
    headline: 'Go All In',
    subheadline: "For the person who's done with half-measures.",
    bullets: [
      'Everything in Live Cohort',
      '1-on-1 VIP session with Coach Erik',
      'Book B: The Limitless Framework PDF',
      'Priority support & VIP badge',
    ],
    price: '₱13,999',
    cta: 'Claim VIP Access',
    accent: Colors.amber,
  },
};

interface Props {
  visible: boolean;
  upsellType: 'basic' | 'cohort' | 'vip';
  onDismiss: () => void;
}

export default function UpsellModal({ visible, upsellType, onDismiss }: Props) {
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((s) => s.user);
  const config = UPSELL_CONFIGS[upsellType];

  // Don't show if user already has this tier or higher
  const TIER_ORDER = ['free', 'basic', 'cohort', 'vip', 'alumni'];
  const userTierIdx = TIER_ORDER.indexOf(user?.tier ?? 'free');
  const upsellTierIdx = TIER_ORDER.indexOf(upsellType);
  if (userTierIdx >= upsellTierIdx) return null;

  const handlePurchase = async () => {
    setLoading(true);
    try {
      await purchaseTier(PRODUCT_IDS[config.tier]);
      // purchaseUpdatedListener in iap.ts handles the rest
    } catch (err: any) {
      if (err?.code !== 'E_USER_CANCELLED') {
        Alert.alert('Purchase failed', err.message ?? 'Please try again.');
      }
    } finally {
      setLoading(false);
      onDismiss();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Accent bar */}
          <View style={[styles.accentBar, { backgroundColor: config.accent }]} />

          <Text style={styles.headline}>{config.headline}</Text>
          <Text style={styles.subheadline}>{config.subheadline}</Text>

          <View style={styles.bullets}>
            {config.bullets.map((b, i) => (
              <View key={i} style={styles.bulletRow}>
                <Text style={[styles.bulletCheck, { color: config.accent }]}>✓</Text>
                <Text style={styles.bulletText}>{b}</Text>
              </View>
            ))}
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>One-time payment</Text>
            <Text style={[styles.price, { color: config.accent }]}>{config.price}</Text>
          </View>

          <TouchableOpacity
            style={[styles.ctaBtn, { backgroundColor: config.accent }]}
            onPress={handlePurchase}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.ctaText}>{config.cta}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.dismissBtn} onPress={onDismiss}>
            <Text style={styles.dismissText}>Maybe later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7,26,52,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: Spacing.xl,
    gap: Spacing.md,
    paddingBottom: 48,
    ...Shadows.card,
  },
  accentBar: {
    height: 4,
    borderRadius: 2,
    width: 48,
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  headline: {
    fontSize: FontSizes['2xl'],
    fontFamily: Fonts.display,
    color: Colors.darkNavy,
    textAlign: 'center',
  },
  subheadline: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body,
    color: Colors.mutedTeal,
    textAlign: 'center',
    lineHeight: 24,
  },
  bullets: { gap: Spacing.sm, marginTop: Spacing.sm },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  bulletCheck: { fontSize: FontSizes.base, fontFamily: Fonts.bodyBold, lineHeight: 24 },
  bulletText: { flex: 1, fontSize: FontSizes.base, fontFamily: Fonts.body, color: Colors.darkNavy, lineHeight: 24 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.sm },
  priceLabel: { fontSize: FontSizes.sm, fontFamily: Fonts.body, color: Colors.mutedTeal },
  price: { fontSize: FontSizes['2xl'], fontFamily: Fonts.display },
  ctaBtn: {
    height: 56,
    borderRadius: Radius.tag,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  ctaText: { fontSize: FontSizes.base, fontFamily: Fonts.bodyBold, color: Colors.white },
  dismissBtn: { alignItems: 'center', paddingVertical: Spacing.sm },
  dismissText: { fontSize: FontSizes.sm, fontFamily: Fonts.body, color: Colors.mutedTeal },
});
