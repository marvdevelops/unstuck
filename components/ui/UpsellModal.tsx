import { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import { Fonts, FontSizes } from '../../constants/typography';
import { Spacing, Radius, Shadows } from '../../constants/spacing';
import { purchaseTier, PRODUCT_IDS } from '../../lib/iap';
import { useAuthStore } from '../../store/useAuthStore';
import { Check } from '../../lib/icons';

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
    accent: Colors.tide,
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
    accent: Colors.success,
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
    accent: Colors.gold,
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

  const TIER_ORDER = ['free', 'basic', 'cohort', 'vip', 'alumni'];
  const userTierIdx = TIER_ORDER.indexOf(user?.tier ?? 'free');
  const upsellTierIdx = TIER_ORDER.indexOf(upsellType);
  if (userTierIdx >= upsellTierIdx) return null;

  const handlePurchase = async () => {
    setLoading(true);
    try {
      await purchaseTier(PRODUCT_IDS[config.tier]);
    } catch (err: any) {
      if (err?.code !== 'E_USER_CANCELLED') {
        Alert.alert('Purchase failed', err.message ?? 'Please try again.');
      }
    } finally {
      setLoading(false);
      onDismiss();
    }
  };

  const handleOpen = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
      onShow={handleOpen}
    >
      <BlurView intensity={45} tint="dark" style={styles.overlay}>
        <View style={styles.overlayDark} />
        <MotiView
          from={{ translateY: 20, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 22 }}
          style={styles.sheetWrapper}
        >
        <LinearGradient colors={['#FFFFFF', '#F4F8FA']} style={styles.sheet}>
          {/* Accent bar — reveals on mount */}
          <MotiView
            from={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ type: 'spring', damping: 20 }}
            style={[styles.accentBar, { backgroundColor: config.accent }]}
          />

          <Text style={styles.headline}>{config.headline}</Text>
          <Text style={styles.subheadline}>{config.subheadline}</Text>

          <View style={styles.bullets}>
            {config.bullets.map((b, i) => (
              <MotiView
                key={i}
                from={{ opacity: 0, translateX: -8 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'timing', duration: 350, delay: i * 60 + 200 }}
                style={styles.bulletRow}
              >
                <Check size={14} color={config.accent} />
                <Text style={styles.bulletText}>{b}</Text>
              </MotiView>
            ))}
          </View>

          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceLabel}>One-time · no subscription</Text>
            </View>
            <Text style={[styles.price, { color: config.accent }]}>{config.price}</Text>
          </View>

          <TouchableOpacity onPress={handlePurchase} disabled={loading} activeOpacity={0.85}>
            <LinearGradient
              colors={config.accent === Colors.gold ? Colors.gradients.ctaGold : config.accent === Colors.success ? Colors.gradients.success : Colors.gradients.cta}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.ctaBtn}
            >
              {loading
                ? <View style={styles.loadingRow}>
                    <ActivityIndicator color={Colors.white} size="small" />
                    <Text style={styles.ctaText}>Processing...</Text>
                  </View>
                : <Text style={styles.ctaText}>{config.cta}</Text>
              }
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dismissBtn} onPress={onDismiss}>
            <Text style={styles.dismissText}>Maybe later</Text>
          </TouchableOpacity>
        </LinearGradient>
        </MotiView>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayDark: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.glass.darkStrong,
  },
  sheetWrapper: {
    borderTopLeftRadius: Radius.modal,
    borderTopRightRadius: Radius.modal,
    overflow: 'hidden',
    ...Shadows.modal,
  },
  sheet: {
    padding: Spacing.xl,
    gap: Spacing.md,
    paddingBottom: 52,
  },
  accentBar: {
    height: 4, borderRadius: 2, width: 48,
    alignSelf: 'center', marginBottom: Spacing.sm,
  },
  headline: {
    fontSize: FontSizes['2xl'], fontFamily: Fonts.display,
    color: Colors.ink, textAlign: 'center',
  },
  subheadline: {
    fontSize: FontSizes.base, fontFamily: Fonts.display, fontStyle: 'italic',
    color: Colors.inkMuted, textAlign: 'center', lineHeight: 24,
  },
  bullets: { gap: Spacing.sm + 2, marginTop: Spacing.sm },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  bulletText: { flex: 1, fontSize: FontSizes.base, fontFamily: Fonts.body, color: Colors.inkSoft, lineHeight: 24 },
  priceRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1, borderTopColor: Colors.sandBorder,
  },
  priceLabel: { fontSize: FontSizes.sm, fontFamily: Fonts.body, color: Colors.inkMuted },
  price: { fontSize: FontSizes['2xl'], fontFamily: Fonts.display },
  ctaBtn: {
    height: 60, borderRadius: Radius.tag,
    alignItems: 'center', justifyContent: 'center', marginTop: Spacing.sm,
  },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ctaText: { fontSize: FontSizes.base, fontFamily: Fonts.bodyBold, color: Colors.white },
  dismissBtn: { alignItems: 'center', paddingVertical: Spacing.sm },
  dismissText: { fontSize: FontSizes.sm, fontFamily: Fonts.body, color: Colors.inkFaint },
});
