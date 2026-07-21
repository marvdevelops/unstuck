import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, X } from '../../lib/icons';
import { Colors } from '../../constants/colors';
import { Fonts, FontSizes } from '../../constants/typography';
import { Spacing, Radius, Shadows } from '../../constants/spacing';
import { stagger } from '../../constants/animations';
import { purchaseTier, restorePurchases, PRODUCT_IDS, openWebsiteCheckout } from '../../lib/iap';
import { useAuthStore } from '../../store/useAuthStore';

const TIER_ORDER = ['free', 'basic', 'cohort', 'vip'] as const;

const { width: W } = Dimensions.get('window');

const TIERS = [
  {
    key:      'basic' as const,
    name:     'DIY',
    price:    '₱1,499',
    tagline:  'Self-paced at your own rhythm',
    bullets:  [
      '21 days of guided neuroscience content',
      'Lifetime access — revisit any day',
      'All 6 power tools unlocked',
      'Full Limitless Toolkit',
    ],
    accent:   Colors.tide,
    gradient: Colors.gradients.cta,
    popular:  false,
  },
  {
    key:      'cohort' as const,
    name:     'Live Cohort',
    price:    '₱7,499',
    tagline:  'Change with a community around you',
    bullets:  [
      'Everything in DIY',
      'Live Zoom calls with Coach Erik',
      'Private accountability group',
      'Weekly group coaching sessions',
    ],
    accent:   Colors.success,
    gradient: Colors.gradients.success,
    popular:  true,
  },
  {
    key:      'vip' as const,
    name:     'VIP Breakthrough',
    price:    '₱13,999',
    tagline:  "For the person done with half-measures",
    bullets:  [
      'Everything in Live Cohort',
      '1-on-1 session with Coach Erik',
      'Book B: The Limitless Framework PDF',
      'Priority support & VIP badge',
    ],
    accent:   Colors.gold,
    gradient: Colors.gradients.ctaGold,
    popular:  false,
  },
] as const;

export default function Paywall() {
  const router = useRouter();
  const { voluntary } = useLocalSearchParams<{ voluntary?: string }>();
  const isVoluntary = voluntary === '1';

  const userTier = useAuthStore((s) => s.user?.tier ?? 'free');
  const ownedIdx = TIER_ORDER.indexOf(userTier as typeof TIER_ORDER[number]);

  const [loading, setLoading] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);

  const handlePurchase = async (tierKey: 'basic' | 'cohort' | 'vip') => {
    // Basic is the only tier sold as a real Apple/Google in-app purchase.
    // Cohort and VIP involve human-delivered coaching and are sold via
    // website checkout instead — tier upgrades happen server-side after payment.
    if (tierKey !== 'basic') {
      await openWebsiteCheckout(tierKey);
      return;
    }

    setLoading(tierKey);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await purchaseTier(PRODUCT_IDS.basic);
      // purchaseUpdatedListener in iap.ts handles tier upgrade + navigation
    } catch (err: any) {
      if (err?.code !== 'E_USER_CANCELLED') {
        Alert.alert('Purchase failed', err?.message ?? 'Please try again.');
      }
    } finally {
      setLoading(null);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      await restorePurchases();
      Alert.alert('Restored', 'Your purchases have been restored.');
    } catch {
      Alert.alert('Nothing to restore', 'No previous purchases found for this account.');
    } finally {
      setRestoring(false);
    }
  };

  return (
    <LinearGradient
      colors={['#071A34', '#0D2A3A', '#071A34']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.root}
    >
      {isVoluntary && (
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <X size={18} color={Colors.darkMuted} />
        </TouchableOpacity>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <MotiView from={{ opacity: 0, translateY: -12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 600 }}>
          <Text style={styles.eyebrow}>
            {isVoluntary ? 'Your plan' : 'Your free trial has ended'}
          </Text>
          <Text style={styles.headline}>
            {isVoluntary ? <>Take it{'\n'}further</> : <>Continue your{'\n'}transformation</>}
          </Text>
          <Text style={styles.subhead}>
            {isVoluntary
              ? 'See what each plan unlocks, and upgrade whenever you\'re ready.'
              : 'Choose the plan that fits your journey.\nOne-time payment · no subscription · lifetime access.'}
          </Text>
        </MotiView>

        {/* Tier cards */}
        {TIERS.map((tier, i) => {
          const isOwned = ownedIdx >= TIER_ORDER.indexOf(tier.key);
          return (
          <MotiView
            key={tier.key}
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', damping: 22, delay: stagger(i, 80) + 200 }}
          >
            <View style={[styles.card, tier.popular && styles.cardPopular, isOwned && styles.cardOwned]}>
              {tier.popular && !isOwned && (
                <LinearGradient colors={Colors.gradients.success} style={styles.popularBadge} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={styles.popularText}>Most popular</Text>
                </LinearGradient>
              )}
              {isOwned && (
                <View style={styles.ownedBadge}>
                  <Check size={11} color={Colors.success} strokeWidth={3} />
                  <Text style={styles.ownedBadgeText}>Included in your plan</Text>
                </View>
              )}

              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.tierName}>{tier.name}</Text>
                  <Text style={styles.tierTagline}>{tier.tagline}</Text>
                </View>
                <View style={styles.priceBlock}>
                  <Text style={[styles.price, { color: tier.accent }]}>{tier.price}</Text>
                  <Text style={styles.priceNote}>
                    {tier.key === 'basic' ? 'one-time' : 'via website'}
                  </Text>
                </View>
              </View>

              <View style={styles.bullets}>
                {tier.bullets.map((b, bi) => (
                  <View key={bi} style={styles.bulletRow}>
                    <View style={[styles.bulletIcon, { backgroundColor: tier.accent + '22' }]}>
                      <Check size={10} color={tier.accent} />
                    </View>
                    <Text style={styles.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>

              {!isOwned && (
                <TouchableOpacity
                  onPress={() => handlePurchase(tier.key)}
                  disabled={loading !== null}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={tier.gradient}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={styles.ctaBtn}
                  >
                    {loading === tier.key ? (
                      <ActivityIndicator color={Colors.white} size="small" />
                    ) : (
                      <Text style={styles.ctaText}>
                        {tier.key === 'basic' ? `Get ${tier.name}` : `Continue on Website`}
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </MotiView>
          );
        })}

        {/* Restore */}
        <TouchableOpacity style={styles.restoreBtn} onPress={handleRestore} disabled={restoring}>
          {restoring
            ? <ActivityIndicator color={Colors.darkMuted} size="small" />
            : <Text style={styles.restoreText}>Already purchased? Restore</Text>
          }
        </TouchableOpacity>

        <Text style={styles.legal}>
          Prices in Philippine Peso. One-time payment, no recurring charges.
          Payment processed by Apple / Google.
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1 },
  scroll:  { flex: 1 },
  content: { paddingHorizontal: Spacing.lg, paddingTop: 72, gap: Spacing.md },

  closeBtn: {
    position: 'absolute',
    top: 56, right: Spacing.lg,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.darkSurface,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 10,
  },

  eyebrow: {
    fontFamily: Fonts.mono,
    fontSize: FontSizes.xs,
    color: Colors.tideMid,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  headline: {
    fontFamily: Fonts.displayItalic,
    fontSize: FontSizes['3xl'],
    color: Colors.white,
    lineHeight: 40,
    marginBottom: Spacing.sm,
  },
  subhead: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.sm,
    color: Colors.darkMuted,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },

  // Card
  card: {
    backgroundColor: Colors.darkSurface,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
    padding: Spacing.lg,
    gap: Spacing.md,
    overflow: 'hidden',
  },
  cardPopular: {
    borderColor: Colors.success + '60',
    backgroundColor: 'rgba(58,122,86,0.10)',
  },
  popularBadge: {
    alignSelf: 'flex-start',
    borderRadius: Radius.tag,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: -4,
  },
  popularText: { fontFamily: Fonts.bodyBold, fontSize: FontSizes.xs, color: Colors.white },
  cardOwned: {
    borderColor: Colors.success + '40',
    backgroundColor: 'rgba(58,122,86,0.06)',
  },
  ownedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: Colors.success + '1A',
    borderRadius: Radius.tag,
    paddingHorizontal: 10, paddingVertical: 4,
    marginBottom: -4,
  },
  ownedBadgeText: { fontFamily: Fonts.bodyMedium, fontSize: FontSizes.xs, color: Colors.success },

  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  tierName:   { fontFamily: Fonts.display, fontSize: FontSizes.xl, color: Colors.white },
  tierTagline:{ fontFamily: Fonts.body, fontSize: FontSizes.xs, color: Colors.darkMuted, marginTop: 3, maxWidth: W * 0.45 },
  priceBlock: { alignItems: 'flex-end' },
  price:      { fontFamily: Fonts.display, fontSize: FontSizes['2xl'] },
  priceNote:  { fontFamily: Fonts.body, fontSize: FontSizes.xs, color: Colors.darkFaint, marginTop: 2 },

  bullets: { gap: 8 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  bulletIcon: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
  bulletText: { flex: 1, fontFamily: Fonts.body, fontSize: FontSizes.sm, color: Colors.darkText, lineHeight: 20 },

  ctaBtn: {
    height: 52, borderRadius: Radius.tag,
    alignItems: 'center', justifyContent: 'center',
    ...Shadows.cta,
  },
  ctaText: { fontFamily: Fonts.bodyBold, fontSize: FontSizes.base, color: Colors.white },

  restoreBtn: { alignItems: 'center', paddingVertical: Spacing.md },
  restoreText: { fontFamily: Fonts.bodyMedium, fontSize: FontSizes.sm, color: Colors.darkMuted },

  legal: {
    fontFamily: Fonts.body,
    fontSize: 10,
    color: Colors.darkFaint,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: Spacing.md,
  },
});
