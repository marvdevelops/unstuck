/**
 * Core Values Wizard — Day 15 interactive spot-challenge component.
 *
 * Steps:
 *   discovery  — Tap every value that speaks to you (no limit)
 *   clustering — Read-only review: mentally group the relatives
 *   leaders    — Re-select 3–5 Leader Values (one per cluster)
 *   celebration— Compass set; values displayed; completion chime plays
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Dimensions, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import Reanimated, {
  useSharedValue, useAnimatedStyle, withSequence, withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, Compass } from '../../lib/icons';
import { CORE_VALUES } from '../../constants/coreValues';
import { Colors } from '../../constants/colors';
import { Fonts, FontSizes } from '../../constants/typography';
import { Spacing, Radius } from '../../constants/spacing';

const { width: W } = Dimensions.get('window');
const CHIP_GAP   = 8;
const COLS       = 3;
const CHIP_W     = (W - Spacing.lg * 2 - CHIP_GAP * (COLS - 1)) / COLS;
const MAX_LEADERS = 5;
const MIN_LEADERS = 3;

type Step = 'discovery' | 'clustering' | 'leaders' | 'celebration';

interface Props {
  visible: boolean;
  onComplete: (leaderValues: string[]) => void;
  onClose: () => void;
}

// ── LeaderChip — chip for the Leaders step with conditional shake ─────────────
// Defined outside the parent so useAnimatedStyle is a legal hook call.
function LeaderChip({
  label, selected, shakingKey, shakeOffset, onPress,
}: {
  label: string;
  selected: boolean;
  shakingKey: Reanimated.SharedValue<string>;
  shakeOffset: Reanimated.SharedValue<number>;
  onPress: () => void;
}) {
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakingKey.value === label ? shakeOffset.value : 0 }],
  }));

  return (
    <Reanimated.View style={animStyle}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.75}
        style={[styles.chip, selected ? styles.chipLeaderActive : styles.chipLeaderInactive]}
      >
        <Text
          style={[styles.chipText, selected ? styles.chipTextLeaderActive : styles.chipTextLeaderInactive]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </Reanimated.View>
  );
}

export default function CoreValuesWizard({ visible, onComplete, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const soundRef = useRef<Audio.Sound | null>(null);

  // ── Reset state on open ───────────────────────────────────────────────────
  const [step, setStep] = useState<Step>('discovery');
  const [rawSelected,  setRawSelected]  = useState<Set<string>>(new Set());
  const [leaders,      setLeaders]      = useState<Set<string>>(new Set());

  // Per-chip shake offsets for the leaders step.
  // Stored as a plain ref-map; we drive them with Reanimated's runOnJS-free
  // approach by keeping a single shakeTarget shared value + currently-shaking key.
  const shakingKey    = useSharedValue('');
  const shakeOffset   = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setStep('discovery');
      setRawSelected(new Set());
      setLeaders(new Set());
    }
  }, [visible]);

  // ── Completion chime ──────────────────────────────────────────────────────
  useEffect(() => {
    if (step === 'celebration') {
      playCelebrationChime();
    }
    return () => {
      if (step !== 'celebration') {
        soundRef.current?.unloadAsync().catch(() => {});
      }
    };
  }, [step]);

  async function playCelebrationChime() {
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/chime.mp3'),
        { shouldPlay: true, volume: 0.7 },
      );
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync().catch(() => {});
        }
      });
    } catch {
      // Asset not present yet — silent fallback
    }
  }

  // ── Step: Discovery ───────────────────────────────────────────────────────
  const toggleRaw = useCallback((value: string) => {
    setRawSelected((prev) => {
      const next = new Set(prev);
      if (next.has(value)) { next.delete(value); } else { next.add(value); }
      Haptics.selectionAsync();
      return next;
    });
  }, []);

  // ── Step: Leaders ─────────────────────────────────────────────────────────
  const toggleLeader = useCallback((value: string) => {
    setLeaders((prev) => {
      if (prev.has(value)) {
        const next = new Set(prev);
        next.delete(value);
        Haptics.selectionAsync();
        return next;
      }
      if (prev.size >= MAX_LEADERS) {
        // Shake this chip via the shared single shake animation
        shakingKey.value  = value;
        shakeOffset.value = withSequence(
          withTiming(-6, { duration: 50 }),
          withTiming(6,  { duration: 50 }),
          withTiming(-4, { duration: 40 }),
          withTiming(4,  { duration: 40 }),
          withTiming(0,  { duration: 30 }),
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return prev;
      }
      const next = new Set(prev);
      next.add(value);
      Haptics.selectionAsync();
      return next;
    });
  }, [shakingKey, shakeOffset]);

  // ── Finish ────────────────────────────────────────────────────────────────
  const handleFinish = () => {
    onComplete(Array.from(leaders));
  };

  // ── Render helpers ────────────────────────────────────────────────────────
  const rawValues    = Array.from(rawSelected);
  const leaderValues = Array.from(leaders);

  // ── Header / nav bar ──────────────────────────────────────────────────────
  function NavBar({ title, onBack }: { title: string; onBack?: () => void }) {
    return (
      <View style={[styles.navBar, { paddingTop: insets.top + 12 }]}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.navBack} hitSlop={12}>
            <ChevronLeft size={20} color={Colors.tideMid} strokeWidth={2} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onClose} style={styles.navBack} hitSlop={12}>
            <Text style={styles.navCloseText}>✕</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.navTitle}>{title}</Text>
        <View style={styles.navSpacer} />
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP: DISCOVERY
  // ─────────────────────────────────────────────────────────────────────────
  if (step === 'discovery') {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View style={styles.screen}>
          <NavBar title="Values Discovery" />

          <View style={styles.headerBlock}>
            <Text style={styles.stepTitle}>Tap every value that speaks to you.</Text>
            <Text style={styles.stepSub}>No pressure — go with your gut. You'll refine later.</Text>
          </View>

          <ScrollView
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {CORE_VALUES.map((value) => {
              const selected = rawSelected.has(value);
              return (
                <TouchableOpacity
                  key={value}
                  onPress={() => toggleRaw(value)}
                  activeOpacity={0.75}
                  style={[styles.chip, selected ? styles.chipRawActive : styles.chipRawInactive]}
                >
                  <Text
                    style={[styles.chipText, selected ? styles.chipTextRawActive : styles.chipTextRaw]}
                    numberOfLines={1}
                  >
                    {value}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
            {rawSelected.size > 0 && (
              <Text style={styles.countBadge}>{rawSelected.size} selected</Text>
            )}
            <TouchableOpacity
              onPress={() => setStep('clustering')}
              disabled={rawSelected.size === 0}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={rawSelected.size > 0 ? Colors.gradients.cta : ['#ccc', '#bbb']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.footerBtn}
              >
                <Text style={styles.footerBtnText}>Next →</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP: CLUSTERING
  // ─────────────────────────────────────────────────────────────────────────
  if (step === 'clustering') {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View style={styles.screen}>
          <NavBar title="Find the Patterns" onBack={() => setStep('discovery')} />

          <ScrollView
            contentContainerStyle={styles.clusterContent}
            showsVerticalScrollIndicator={false}
          >
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 400 }}
            >
              <Text style={styles.stepTitle}>Look at your values.</Text>
              <Text style={styles.clusterBody}>
                Some of these words are relatives — they belong to the same family.
                Mentally group them. You don't need to drag anything.
                {'\n\n'}
                Just notice which ones feel related.
              </Text>
            </MotiView>

            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: 'timing', duration: 500, delay: 300 }}
              style={styles.chipsWrap}
            >
              {rawValues.map((value, i) => (
                <MotiView
                  key={value}
                  from={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', delay: i * 30 }}
                >
                  <View style={[styles.chip, styles.chipReadOnly]}>
                    <Text style={styles.chipTextReadOnly}>{value}</Text>
                  </View>
                </MotiView>
              ))}
            </MotiView>
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
            <TouchableOpacity onPress={() => setStep('leaders')} activeOpacity={0.85}>
              <LinearGradient
                colors={Colors.gradients.cta}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.footerBtn}
              >
                <Text style={styles.footerBtnText}>I see the groups →</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP: LEADERS
  // ─────────────────────────────────────────────────────────────────────────
  if (step === 'leaders') {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View style={styles.screen}>
          <NavBar title="Pick Your Leaders" onBack={() => setStep('clustering')} />

          <View style={styles.headerBlock}>
            <Text style={styles.stepTitle}>Pick your {MIN_LEADERS}–{MAX_LEADERS} Leader Values.</Text>
            <Text style={styles.stepSub}>
              One word that captures the essence of each group.
            </Text>
          </View>

          <ScrollView
            contentContainerStyle={styles.chipsWrap}
            showsVerticalScrollIndicator={false}
          >
            {rawValues.map((value) => (
              <LeaderChip
                key={value}
                label={value}
                selected={leaders.has(value)}
                shakingKey={shakingKey}
                shakeOffset={shakeOffset}
                onPress={() => toggleLeader(value)}
              />
            ))}
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
            <Text style={styles.countBadge}>
              {leaders.size} of {MAX_LEADERS} leaders chosen
              {leaders.size < MIN_LEADERS ? ` — pick at least ${MIN_LEADERS}` : ''}
            </Text>
            <TouchableOpacity
              onPress={() => setStep('celebration')}
              disabled={leaders.size < MIN_LEADERS}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={leaders.size >= MIN_LEADERS ? Colors.gradients.cta : ['#ccc', '#bbb']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.footerBtn}
              >
                <Text style={styles.footerBtnText}>Set My Compass</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP: CELEBRATION
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Modal visible={visible} animationType="fade" onRequestClose={handleFinish}>
      <LinearGradient
        colors={[Colors.darkNavy, '#0D2233']}
        style={[styles.celebScreen, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
      >
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 18 }}
          style={styles.celebContent}
        >
          <MotiView
            from={{ opacity: 0, translateY: -8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500, delay: 200 }}
          >
            <Compass size={40} color={Colors.gold} strokeWidth={1.5} />
          </MotiView>

          <Text style={styles.celebHeadline}>Your compass is set.</Text>

          <View style={styles.celebBadgesRow}>
            {leaderValues.map((v, i) => (
              <MotiView
                key={v}
                from={{ opacity: 0, scale: 0.7, translateY: 10 }}
                animate={{ opacity: 1, scale: 1, translateY: 0 }}
                transition={{ type: 'spring', delay: i * 80 + 300 }}
              >
                <LinearGradient
                  colors={[Colors.gold + '22', Colors.gold + '11']}
                  style={styles.celebBadge}
                >
                  <Text style={styles.celebBadgeText}>{v}</Text>
                </LinearGradient>
              </MotiView>
            ))}
          </View>

          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 600, delay: leaderValues.length * 80 + 400 }}
          >
            <Text style={styles.celebCarryForward}>
              These will appear at the top of your dashboard for Days 16–21 as your daily compass check.
            </Text>

            <View style={styles.celebDivider} />

            <Text style={styles.celebCalendarPrompt}>
              Look at your calendar for today. Is at least one block of time or energy dedicated to honoring these leaders?
            </Text>
          </MotiView>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 900 }}
          style={styles.celebFooter}
        >
          <TouchableOpacity onPress={handleFinish} activeOpacity={0.85}>
            <LinearGradient
              colors={Colors.gradients.ctaGold}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.footerBtn}
            >
              <Text style={styles.footerBtnText}>Done — I'm aligned ✓</Text>
            </LinearGradient>
          </TouchableOpacity>
        </MotiView>
      </LinearGradient>
    </Modal>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.sand,
  },

  // Nav bar
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.sandBorder,
    backgroundColor: Colors.sand,
  },
  navBack:      { width: 36 },
  navCloseText: { fontSize: 18, color: Colors.inkMuted },
  navTitle:     { flex: 1, textAlign: 'center', fontFamily: Fonts.bodyBold, fontSize: FontSizes.base, color: Colors.ink },
  navSpacer:    { width: 36 },

  // Header block
  headerBlock: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  stepTitle: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xl,
    color: Colors.ink,
    marginBottom: 6,
  },
  stepSub: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.sm,
    color: Colors.inkMuted,
    lineHeight: 20,
  },

  // Grid (discovery)
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: CHIP_GAP,
    paddingBottom: Spacing.xl,
  },

  // Chips shared
  chip: {
    width: CHIP_W,
    height: 40,
    borderRadius: Radius.tag,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  chipText: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.xs,
    textAlign: 'center',
  },

  // Discovery chip states
  chipRawInactive: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.sandBorder,
  },
  chipRawActive: {
    backgroundColor: Colors.tide,
    borderWidth: 1,
    borderColor: Colors.tideDeep,
  },
  chipTextRaw:       { color: Colors.inkSoft },
  chipTextRawActive: { color: Colors.white, fontFamily: Fonts.bodyBold },

  // Clustering chip (read-only)
  chipReadOnly: {
    backgroundColor: Colors.tideLight,
    borderWidth: 1,
    borderColor: Colors.tide + '60',
    width: 'auto' as any,
    paddingHorizontal: Spacing.sm,
  },
  chipTextReadOnly: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.sm,
    color: Colors.tideDeep,
  },

  // Leader chip states
  chipLeaderInactive: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.sandBorder,
    width: 'auto' as any,
    paddingHorizontal: Spacing.sm,
  },
  chipLeaderActive: {
    backgroundColor: Colors.gold + '18',
    borderWidth: 2,
    borderColor: Colors.gold,
    width: 'auto' as any,
    paddingHorizontal: Spacing.sm,
  },
  chipTextLeaderInactive: { color: Colors.inkSoft,  fontSize: FontSizes.sm },
  chipTextLeaderActive:   { color: Colors.gold,     fontSize: FontSizes.sm, fontFamily: Fonts.bodyBold },

  // Wrap (clustering + leaders — flex wrap row)
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CHIP_GAP,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },

  // Clustering content (needs scroll)
  clusterContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  clusterBody: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.base,
    color: Colors.inkSoft,
    lineHeight: 26,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },

  // Footer
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.sandBorder,
    backgroundColor: Colors.sand,
    gap: Spacing.sm,
  },
  footerBtn: {
    height: 56,
    borderRadius: Radius.tag,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBtnText: {
    fontFamily: Fonts.bodyBold,
    fontSize: FontSizes.base,
    color: Colors.white,
  },
  countBadge: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.xs,
    color: Colors.inkMuted,
    textAlign: 'center',
  },

  // Celebration
  celebScreen: {
    flex: 1,
    justifyContent: 'space-between',
  },
  celebContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    gap: Spacing.lg,
  },
  celebHeadline: {
    fontFamily: Fonts.display,
    fontSize: FontSizes['3xl'],
    color: Colors.white,
    textAlign: 'center',
  },
  celebBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  celebBadge: {
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.gold,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  celebBadgeText: {
    fontFamily: Fonts.bodyBold,
    fontSize: FontSizes.sm,
    color: Colors.gold,
  },
  celebCarryForward: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.sm,
    color: Colors.white75,
    textAlign: 'center',
    lineHeight: 22,
  },
  celebDivider: {
    height: 1,
    backgroundColor: Colors.white12,
    marginVertical: Spacing.md,
  },
  celebCalendarPrompt: {
    fontFamily: Fonts.displayLightItalic ?? Fonts.body,
    fontSize: FontSizes.base,
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 26,
  },
  celebFooter: {
    paddingHorizontal: Spacing.lg,
  },
});
