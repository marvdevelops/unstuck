import { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Check, Lock } from '../../lib/icons';
import FluidBlob from '../../components/ui/FluidBlob';
import UpsellModal from '../../components/ui/UpsellModal';
import { CURRICULUM } from '../../constants/curriculum';
import { useJourneyStore } from '../../store/useJourneyStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Colors } from '../../constants/colors';
import { Fonts, FontSizes } from '../../constants/typography';
import { Spacing, Radius, Shadows } from '../../constants/spacing';

const FREE_DAY_LIMIT = 5;

export default function JourneyList() {
  const router = useRouter();
  const { isDayComplete, isDayUnlocked } = useJourneyStore();
  const user = useAuthStore((s) => s.user);
  const isPaid = user?.tier && user.tier !== 'free';

  const [upsellVisible, setUpsellVisible] = useState(false);

  const phases = ['Phase 1: Catalyst', 'Phase 2: Ignite', 'Phase 3: Own It'];

  return (
    <>
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <FluidBlob size={180} colors={Colors.gradients.blobTide} style={{ top: 20, right: -60, opacity: 0.15 }} speed={11000} />
      <Text style={styles.pageTitle}>Your 21-Day Journey</Text>

      {phases.map((phase, phaseIdx) => (
        <View key={phase} style={styles.phaseSection}>
          {/* Phase header with fading gradient rule */}
          <View style={styles.phaseDividerRow}>
            <Text style={styles.phaseLabel}>{phase}</Text>
            <LinearGradient
              colors={[Colors.tide + '40', 'transparent']}
              start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
              style={styles.phaseLine}
            />
          </View>

          {CURRICULUM.filter((d) => d.phase === phase).map((day, i) => {
            const complete = isDayComplete(day.day);
            const unlocked = isDayUnlocked(day.day);
            const isActive = unlocked && !complete;
            const isPaywalled = !isPaid && day.day > FREE_DAY_LIMIT;

            const handlePress = () => {
              if (isPaywalled) { setUpsellVisible(true); return; }
              if (unlocked) router.push(`/(app)/day/${day.day}`);
            };

            return (
              <MotiView
                key={day.day}
                from={{ opacity: 0, translateX: -8 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'timing', duration: 350, delay: i * 40 + phaseIdx * 80 }}
              >
                <TouchableOpacity
                  style={[
                    styles.dayCard,
                    complete && styles.dayCardComplete,
                    isActive && styles.dayCardActive,
                    (!unlocked || isPaywalled) && styles.dayCardLocked,
                  ]}
                  onPress={handlePress}
                  activeOpacity={unlocked || isPaywalled ? 0.75 : 1}
                >
                  {/* Badge — gradient for complete + active */}
                  {complete ? (
                    <LinearGradient colors={Colors.gradients.success} style={styles.dayBadge}>
                      <Check size={16} color={Colors.white} strokeWidth={3} />
                    </LinearGradient>
                  ) : isActive ? (
                    <LinearGradient colors={Colors.gradients.cta} style={styles.dayBadge}>
                      <Text style={[styles.dayNum, styles.dayNumActive]}>{day.day}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={[styles.dayBadge, styles.dayBadgeLocked]}>
                      <Text style={[styles.dayNum, !unlocked && styles.dayNumLocked]}>{day.day}</Text>
                    </View>
                  )}

                  {/* Info */}
                  <View style={styles.dayInfo}>
                    <Text style={[
                      styles.dayTitle,
                      complete && styles.dayTitleComplete,
                      !unlocked && styles.dayTitleLocked,
                    ]}>
                      {day.title}
                    </Text>
                  </View>

                  {/* Lock / paywall indicator */}
                  {isPaywalled ? (
                    <View style={styles.paywallTag}>
                      <Lock size={10} color={Colors.gold} strokeWidth={2} />
                      <Text style={styles.paywallTagText}>PRO</Text>
                    </View>
                  ) : !unlocked ? (
                    <Lock size={14} color={Colors.inkFaint} strokeWidth={1.8} />
                  ) : null}
                </TouchableOpacity>
              </MotiView>
            );
          })}
        </View>
      ))}

      <View style={{ height: 100 }} />
    </ScrollView>

    <UpsellModal
      visible={upsellVisible}
      upsellType="basic"
      onDismiss={() => setUpsellVisible(false)}
    />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.sand },
  content: { paddingHorizontal: Spacing.lg, paddingTop: 64, gap: Spacing.sm },

  pageTitle: {
    fontSize: FontSizes['2xl'], fontFamily: Fonts.display,
    color: Colors.ink, marginBottom: Spacing.sm,
  },

  phaseSection: { gap: Spacing.sm },

  phaseDividerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.sm, marginBottom: 4 },
  phaseLine: { flex: 1, height: 1.5, borderRadius: 1 },
  phaseLabel: {
    fontSize: FontSizes.lg, fontFamily: Fonts.displayItalic,
    color: Colors.tide, flexShrink: 0,
  },

  dayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.sandBorder,
  },
  dayCardComplete: {
    backgroundColor: Colors.successLight,
    borderColor: Colors.success + '40',
  },
  dayCardActive: {
    borderColor: Colors.tide,
    borderWidth: 1.5,
  },
  dayCardLocked: { opacity: 0.5 },

  dayBadge: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  dayBadgeLocked: { backgroundColor: Colors.sandDeep },

  dayNum: { fontSize: FontSizes.base, fontFamily: Fonts.bodyBold, color: Colors.inkMuted },
  dayNumActive:  { color: Colors.white },
  dayNumLocked:  { color: Colors.inkFaint },

  dayInfo: { flex: 1 },
  dayTitle: {
    fontSize: FontSizes.base, fontFamily: Fonts.display, color: Colors.ink,
  },
  dayCardShadow: { ...Shadows.card },
  dayTitleComplete: { color: Colors.success },
  dayTitleLocked:   { color: Colors.inkFaint },

  paywallTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.gold + '22',
    borderWidth: 1,
    borderColor: Colors.gold + '55',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  paywallTagText: {
    fontFamily: Fonts.mono,
    fontSize: 9,
    color: Colors.gold,
    letterSpacing: 1.2,
  },
});
