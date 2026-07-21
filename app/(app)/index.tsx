import {
  Animated, View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Timer, Waves, Layers, Wind, Hand, Moon, Play, Check, Circle, Award, RefreshCw, Archive } from '../../lib/icons';
import { useUserStore } from '../../store/useUserStore';
import { useJourneyStore } from '../../store/useJourneyStore';
import { useToolStore } from '../../store/useToolStore';
import { useAuthStore } from '../../store/useAuthStore';
import { CURRICULUM } from '../../constants/curriculum';
import { Colors } from '../../constants/colors';
import { Fonts, FontSizes } from '../../constants/typography';
import { Spacing, Radius, Shadows } from '../../constants/spacing';
import { Timing, stagger } from '../../constants/animations';
import AttentionStealers from '../../components/dashboard/AttentionStealers';
import FluidBlob from '../../components/ui/FluidBlob';
import UpsellModal from '../../components/ui/UpsellModal';
import { archiveCurrentCycle, resetJourneyForNewCycle } from '../../lib/journeyReset';

const { width: W } = Dimensions.get('window');

// Derive short chip label from full task string
function getShortLabel(task: string): string {
  const t = task.toLowerCase();
  if (t.includes('breath'))                              return 'Breathe';
  if (t.includes('sunlight') || t.includes('window'))   return 'Sunlight';
  if (t.includes('affirmation') || t.includes('statement') || t.includes('say your')) return 'Affirm';
  if (t.includes('water') || t.includes('glass'))       return 'Hydrate';
  if (t.includes('movement') || t.includes('stretch') || t.includes('physical')) return 'Move';
  if (t.includes('10') && t.includes('focus'))          return 'Focus 10';
  if (t.includes('25') || t.includes('sprint'))         return 'Sprint';
  if (t.includes('brain dump') || t.includes('nighttime') || (t.includes('before bed') && t.includes('task'))) return 'Brain Dump';
  if (t.includes('journal') || t.includes('3 wins'))   return 'Journal';
  return task.split(' ').slice(0, 2).join(' ').slice(0, 10);
}

// ── Layout math ──────────────────────────────────────────────────────────────
const CONTENT_W   = W - Spacing.lg * 2;
const EXP_GAP     = 8;
const COL_GAP     = 6;
const PILL_W_EXP  = (CONTENT_W - EXP_GAP) / 2;
const PILL_H_EXP  = 64;
const PILL_W_COL  = (CONTENT_W - COL_GAP * 3) / 4;
const PILL_H_COL  = 46;   // tall enough for value + one-line label
const STATS_H_EXP = PILL_H_EXP * 2 + EXP_GAP;
const STATS_H_COL = PILL_H_COL;

// Per-pill: [expandedLeft, expandedTop, collapsedLeft, collapsedTop]
const PILL_POSITIONS = [0, 1, 2, 3].map((i) => ({
  expLeft: (i % 2)        * (PILL_W_EXP + EXP_GAP),
  expTop:  Math.floor(i / 2) * (PILL_H_EXP + EXP_GAP),
  colLeft: i              * (PILL_W_COL + COL_GAP),
  colTop:  0,
}));

const COLLAPSE_SCROLL = 80;

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 6  && h < 12) return 'Good morning';
  if (h >= 12 && h < 17) return 'Good afternoon';
  if (h >= 17 && h < 21) return 'Good evening';
  return 'Still up';
}

function SectionRow({ label, onViewAll }: { label: string; onViewAll?: () => void }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {onViewAll && (
        <TouchableOpacity onPress={onViewAll}>
          <Text style={styles.sectionViewAll}>View all</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const TOOLS = [
  { key: 'pomodoro',  label: 'Focus Timer',    sub: '25-min deep work',  Icon: Timer,  gradient: Colors.gradients.iconTide, iconColor: Colors.tideDeep, route: '/(app)/tools/pomodoro',  disabledOnHardStop: true },
  { key: 'release',   label: 'Release Corner', sub: 'Process emotions',   Icon: Waves,  gradient: Colors.gradients.iconWave, iconColor: '#4A5AAA',        route: '/(app)/tools/release',   disabledOnHardStop: false },
  { key: 'breathing', label: '3-Min Reset',    sub: 'Guided breathing',   Icon: Wind,   gradient: Colors.gradients.iconWind, iconColor: '#2A7A6A',        route: '/(app)/tools/breathing', disabledOnHardStop: false },
  { key: 'batching',  label: 'Context Bins',   sub: 'Sort your tasks',    Icon: Layers, gradient: Colors.gradients.iconGold, iconColor: Colors.goldText,  route: '/(app)/tools/batching',  disabledOnHardStop: true },
  { key: 'havening',  label: 'Havening Touch', sub: 'Calm your system',   Icon: Hand,   gradient: Colors.gradients.iconTide, iconColor: Colors.tideDeep, route: '/(app)/tools/havening', disabledOnHardStop: false },
  { key: 'zen',       label: 'Zen Mode',       sub: 'Hide distractions',  Icon: Moon,   gradient: Colors.gradients.iconZen,  iconColor: '#6A4A9A',        route: '',                       disabledOnHardStop: false },
];

export default function Dashboard() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  const firstName      = useUserStore((s) => s.onboarding.first_name ?? 'there');
  const coreValues     = useUserStore((s) => s.coreValues);
  const { isDayComplete, hardStopActive, progress } = useJourneyStore();
  const { zenMode, victoryLog, toggleZenMode } = useToolStore();
  const userTier       = useAuthStore((s) => s.user?.tier ?? 'free');

  const FREE_DAY_LIMIT = 5;
  const [paywallVisible, setPaywallVisible] = useState(false);

  // Navigate to a day — shows paywall instead if free user is past the limit
  const goToDay = (day: number) => {
    if (userTier === 'free' && day > FREE_DAY_LIMIT) {
      setPaywallVisible(true);
    } else {
      router.push(`/(app)/day/${day}` as any);
    }
  };

  const currentDay     = CURRICULUM.findIndex((d) => !isDayComplete(d.day)) + 1 || 21;
  const dayData        = CURRICULUM[currentDay - 1];
  const routineTasks   = progress[currentDay]?.routineTasks ?? [];
  const completedCount = CURRICULUM.filter((d) => isDayComplete(d.day)).length;
  const progressPct    = Math.round((completedCount / 21) * 100);
  const winsCount      = victoryLog.length;
  const cycleComplete  = completedCount === 21;

  const [resetting, setResetting] = useState(false);

  const doReset = async (shouldArchive: boolean) => {
    setResetting(true);
    if (shouldArchive) {
      const archived = await archiveCurrentCycle();
      if (!archived) {
        setResetting(false);
        Alert.alert(
          "Couldn't archive",
          'Check your connection and try again — your progress has not been touched.',
        );
        return;
      }
    }
    await resetJourneyForNewCycle();
    setResetting(false);
    Alert.alert('Fresh start', "You're back at Day 1. Let's go again.");
  };

  const handleResetPress = () => {
    Alert.alert(
      'Reset your 21-day journey?',
      'You can archive your current progress, journals, and stats before starting over — or reset without saving.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset without saving', style: 'destructive', onPress: () => doReset(false) },
        { text: 'Archive & Reset', onPress: () => doReset(true) },
      ],
    );
  };

  const stats = [
    { value: `Day ${currentDay}`, label: `of 21 · ${dayData?.phase ?? ''}`, short: `of 21`,    route: '/(app)/journey'   },
    { value: `${progressPct}%`,   label: 'journey complete',                 short: 'done',    route: '/(app)/journey'   },
    { value: `${completedCount}`, label: 'days done',                        short: 'days',    route: '/(app)/journey'   },
    { value: `${winsCount}`,      label: 'wins logged',                      short: 'wins',    route: '/(app)/victories' },
  ];

  // ── Derived animated values ───────────────────────────────────────────────
  const t = (out0: number, out1: number) =>
    scrollY.interpolate({ inputRange: [0, COLLAPSE_SCROLL], outputRange: [out0, out1], extrapolate: 'clamp' });

  const statsContainerH  = t(STATS_H_EXP, STATS_H_COL);
  const heroPaddingBot   = t(Spacing.lg, 12);
  // Text label crossfade
  const labelOpacity     = t(1, 0);
  const shortOpacity     = t(0, 1);

  if (zenMode) {
    return (
      <View style={[styles.container, { backgroundColor: Colors.white }]}>
        <TouchableOpacity style={[styles.exitZen, { top: insets.top + 16 }]} onPress={toggleZenMode}>
          <Text style={styles.exitZenText}>Exit Zen Mode</Text>
        </TouchableOpacity>
        <View style={styles.zenContent}>
          <Text style={styles.zenDay}>Day {currentDay}</Text>
          <Text style={styles.zenTitle}>{dayData?.title}</Text>
          <Text style={styles.zenScience}>{dayData?.science}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* ── HERO HEADER ── */}
      <Animated.View style={[styles.heroWrapper, { paddingTop: insets.top + 12, paddingBottom: heroPaddingBot }]}>
        <LinearGradient
          colors={Colors.gradients.hero}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <FluidBlob
          size={140}
          colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.03)']}
          style={{ top: -40, right: -30 }}
          speed={11000} morphIntensity={0.22} pointerEvents="none"
        />

        {/* Greeting */}
        <View style={styles.heroTop}>
          <Text style={styles.heroGreeting}>{getGreeting()},</Text>
          <Text style={styles.heroName}>{firstName}'s Journey</Text>
        </View>

        {/* Stats — animating absolute pills */}
        <Animated.View style={[styles.statsContainer, { height: statsContainerH }]}>
          {stats.map((stat, i) => {
            const pos = PILL_POSITIONS[i];
            return (
              <Animated.View
                key={i}
                style={[
                  styles.statPill,
                  {
                    left:   t(pos.expLeft, pos.colLeft),
                    top:    t(pos.expTop,  pos.colTop),
                    width:  t(PILL_W_EXP,  PILL_W_COL),
                    height: t(PILL_H_EXP,  PILL_H_COL),
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.statPillInner}
                  onPress={() => router.push(stat.route as any)}
                  activeOpacity={0.75}
                >
                  {/* Value */}
                  <Text style={styles.statValue} numberOfLines={1}>{stat.value}</Text>

                  {/* Label row — fixed height so long + short labels share the same space */}
                  <View style={styles.statLabelWrap}>
                    <Animated.Text style={[styles.statLabel, { opacity: labelOpacity }]} numberOfLines={1}>
                      {stat.label}
                    </Animated.Text>
                    <Animated.Text style={[styles.statLabelShort, { opacity: shortOpacity }]} numberOfLines={1}>
                      {stat.short}
                    </Animated.Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </Animated.View>
      </Animated.View>

      {/* ── SCROLL BODY ── */}
      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
      >
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <FluidBlob size={220} colors={Colors.gradients.blobTide} style={{ top: 20, right: -80, opacity: 0.20 }} speed={10000} />
          <FluidBlob size={150} colors={Colors.gradients.blobGold} style={{ top: 320, left: -50, opacity: 0.14 }} speed={13000} morphIntensity={0.35} />
        </View>

        {/* Daily Compass — visible Days 16–21 once core values are set */}
        {currentDay > 15 && coreValues.length > 0 && (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ ...Timing.springs.gentle, delay: 40 }}
            style={styles.compassCard}
          >
            <Text style={styles.compassLabel}>Your Daily Compass</Text>
            <View style={styles.compassBadgesRow}>
              {coreValues.map((v) => (
                <View key={v} style={styles.compassBadge}>
                  <Text style={styles.compassBadgeText}>{v}</Text>
                </View>
              ))}
            </View>
          </MotiView>
        )}

        {/* Cycle complete — graduation card + reset */}
        {cycleComplete ? (
          <MotiView from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ ...Timing.springs.gentle, delay: 60 }}>
            <LinearGradient colors={Colors.gradients.ctaGold} style={styles.gradCard} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }}>
              <Award size={30} color={Colors.white} strokeWidth={1.5} />
              <Text style={styles.gradTitle}>21 days complete.</Text>
              <Text style={styles.gradBody}>You're no longer the same person who started this. Ready to go again?</Text>

              <TouchableOpacity
                style={styles.gradResetBtn}
                onPress={handleResetPress}
                disabled={resetting}
                activeOpacity={0.85}
              >
                {resetting
                  ? <ActivityIndicator color={Colors.goldText} size="small" />
                  : <>
                      <RefreshCw size={14} color={Colors.goldText} />
                      <Text style={styles.gradResetBtnText}>Reset to Day 1</Text>
                    </>
                }
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.gradArchiveLink}
                onPress={() => router.push('/(app)/archive' as any)}
                activeOpacity={0.7}
              >
                <Archive size={13} color="rgba(255,255,255,0.85)" />
                <Text style={styles.gradArchiveLinkText}>View past cycles</Text>
              </TouchableOpacity>
            </LinearGradient>
          </MotiView>
        ) : (
          <MotiView from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ ...Timing.springs.gentle, delay: 60 }}>
            <TouchableOpacity style={styles.heroCard} onPress={() => goToDay(currentDay)} activeOpacity={0.9}>
              {hardStopActive ? (
                <View style={styles.hardStopRow}>
                  <Text style={styles.hardStopText}>Rest Mode Active</Text>
                </View>
              ) : (
                <>
                  <View>
                    <Text style={styles.heroCardPhase}>{dayData?.phase}</Text>
                    <Text style={styles.heroCardTitle}>{dayData?.title}</Text>
                  </View>
                  <LinearGradient colors={Colors.gradients.cta} style={styles.continueBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <Play size={14} color={Colors.white} />
                    <Text style={styles.continueBtnText}>Continue Day {currentDay}</Text>
                  </LinearGradient>
                </>
              )}
            </TouchableOpacity>
          </MotiView>
        )}

        {/* Today's practice — horizontal routine chips */}
        {!cycleComplete && dayData && dayData.routine.length > 0 && (
          <>
            <SectionRow
              label="Today's practice"
              onViewAll={() => goToDay(currentDay)}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {dayData.routine.map((task, i) => {
                const isComplete = routineTasks[i] ?? false;
                const firstIncomplete = routineTasks.findIndex((v) => !v);
                const isActive = !isComplete && (firstIncomplete === i || (firstIncomplete === -1 && i === 0));
                return (
                  <MotiView
                    key={i}
                    from={{ opacity: 0, translateX: -12 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ ...Timing.springs.gentle, delay: stagger(i, 70) }}
                  >
                    <TouchableOpacity
                      onPress={() => goToDay(currentDay)}
                      activeOpacity={0.82}
                    >
                      {isActive ? (
                        <LinearGradient
                          colors={Colors.gradients.cta}
                          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                          style={styles.chip}
                        >
                          <Circle size={14} color={Colors.white} />
                          <Text style={[styles.chipLabel, { color: Colors.white }]}>
                            {getShortLabel(task)}
                          </Text>
                        </LinearGradient>
                      ) : (
                        <View style={[styles.chip, {
                          backgroundColor: isComplete ? Colors.successLight : Colors.tideLight,
                          borderWidth: 1,
                          borderColor: isComplete ? Colors.success + '40' : Colors.sandBorder,
                        }]}>
                          {isComplete
                            ? <Check size={14} color={Colors.success} />
                            : <Circle size={14} color={Colors.inkFaint} />
                          }
                          <Text style={[styles.chipLabel, {
                            color: isComplete ? Colors.success : Colors.inkMuted,
                            textDecorationLine: isComplete ? 'line-through' : 'none',
                          }]}>
                            {getShortLabel(task)}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </MotiView>
                );
              })}
            </ScrollView>
          </>
        )}

        {/* Toolkit */}
        <SectionRow label="Your toolkit" />
        <View style={styles.toolGrid}>
          {TOOLS.map((tool, i) => {
            const disabled = hardStopActive && tool.disabledOnHardStop;
            return (
              <MotiView
                key={tool.key}
                from={{ opacity: 0, translateY: 12 }}
                animate={{ opacity: disabled ? 0.3 : 1, translateY: 0 }}
                transition={{ ...Timing.springs.gentle, delay: stagger(i, 55) }}
                style={styles.toolCardWrapper}
              >
                <TouchableOpacity
                  style={styles.toolCard}
                  onPress={() => {
                    if (disabled) return;
                    if (tool.key === 'zen') { toggleZenMode(); return; }
                    router.push(tool.route as any);
                  }}
                  activeOpacity={0.82}
                >
                  <LinearGradient colors={tool.gradient} style={styles.toolIconBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <tool.Icon size={18} color={tool.iconColor} />
                  </LinearGradient>
                  <Text style={styles.toolName}>{tool.label}</Text>
                  <Text style={styles.toolSub}>{tool.sub}</Text>
                </TouchableOpacity>
              </MotiView>
            );
          })}
        </View>

        {/* Attention Stealers */}
        <SectionRow label="Attention stealers" />
        <AttentionStealers />

        {/* Victory Log */}
        {victoryLog.length > 0 && (
          <>
            <SectionRow label="Victory log" onViewAll={() => router.push('/(app)/victories' as any)} />
            {victoryLog.slice(0, 3).map((entry, i) => (
              <MotiView
                key={i}
                from={{ opacity: 0, translateX: -8 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'timing', duration: 380, delay: stagger(i, 60) }}
                style={styles.victoryCard}
              >
                <View style={styles.victoryMoodBadge}>
                  <Text style={styles.victoryMoodText}>{entry.mood}</Text>
                </View>
                <Text style={styles.victoryText} numberOfLines={2}>{entry.text}</Text>
                <Text style={styles.victoryDate}>
                  {new Date(entry.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                </Text>
              </MotiView>
            ))}
            {victoryLog.length > 3 && (
              <TouchableOpacity onPress={() => router.push('/(app)/victories' as any)} style={styles.viewAllBtn}>
                <Text style={styles.viewAllText}>View all {victoryLog.length} wins →</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </Animated.ScrollView>

      {/* Paywall — free user taps into a locked day from the dashboard */}
      <UpsellModal
        visible={paywallVisible}
        upsellType="basic"
        onDismiss={() => setPaywallVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.sand },

  heroWrapper: {
    paddingHorizontal: Spacing.lg,
    borderBottomLeftRadius:  Radius.hero,
    borderBottomRightRadius: Radius.hero,
    overflow: 'hidden',
    zIndex: 2,
    ...Shadows.hero,
  },
  heroTop: { marginBottom: Spacing.sm },
  heroGreeting: { fontFamily: Fonts.body, fontSize: FontSizes.xs, color: 'rgba(255,255,255,0.65)', marginBottom: 2 },
  heroName:     { fontFamily: Fonts.display, fontSize: 22, color: Colors.white },

  // Stats container — height animates
  statsContainer: { position: 'relative' },

  // Each pill is absolute-positioned and animates its box
  statPill: {
    position: 'absolute',
    overflow: 'hidden',
    borderRadius: 13,
  },
  statPillInner: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 13,
    paddingHorizontal: 10,
    paddingTop: 9,
    paddingBottom: 7,
    justifyContent: 'space-between',
  },
  statValue: {
    fontFamily: Fonts.mono,
    fontSize: FontSizes.base,   // 15 — comfortably fits in both heights
    color: Colors.white,
    lineHeight: 19,
  },
  // Fixed-height wrapper so long + short labels occupy the same row,
  // never pushing value text or overflowing the pill
  statLabelWrap: {
    height: 13,
    overflow: 'hidden',
  },
  statLabel: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.xs,     // 11
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 13,
    position: 'absolute',
    top: 0, left: 0, right: 0,
  },
  statLabelShort: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.xs,     // 11
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 13,
    position: 'absolute',
    top: 0, left: 0, right: 0,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, gap: Spacing.md },

  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: Spacing.lg,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radius.tag,
  },
  chipLabel: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.sm,
  },

  heroCard: {
    backgroundColor: Colors.white, borderRadius: Radius.card,
    padding: Spacing.lg, gap: Spacing.md,
    borderWidth: 1, borderColor: Colors.sandBorder,
    ...Shadows.card, overflow: 'hidden',
  },
  heroCardPhase: { fontFamily: Fonts.bodyMedium, fontSize: FontSizes.xs, color: Colors.tideMid, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 4 },
  heroCardTitle: { fontFamily: Fonts.displayItalic, fontSize: FontSizes.xl, color: Colors.ink, lineHeight: 30 },
  continueBtn: { borderRadius: Radius.tag, height: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  continueBtnText: { fontFamily: Fonts.bodyBold, fontSize: FontSizes.base, color: Colors.white },
  hardStopRow: { alignItems: 'center', padding: Spacing.sm },
  hardStopText: { fontFamily: Fonts.displayLightItalic, fontSize: FontSizes.base, color: Colors.inkMuted },

  // Cycle-complete graduation card
  gradCard: {
    borderRadius: Radius.card,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: 6,
    ...Shadows.card,
  },
  gradTitle: { fontFamily: Fonts.display, fontSize: FontSizes.xl, color: Colors.white, marginTop: 2 },
  gradBody: {
    fontFamily: Fonts.body, fontSize: FontSizes.sm, color: 'rgba(255,255,255,0.85)',
    textAlign: 'center', lineHeight: 20, marginBottom: 4,
  },
  gradResetBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.white,
    borderRadius: Radius.tag,
    height: 46, paddingHorizontal: Spacing.lg,
    alignSelf: 'stretch',
  },
  gradResetBtnText: { fontFamily: Fonts.bodyBold, fontSize: FontSizes.base, color: Colors.goldText },
  gradArchiveLink: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 4, paddingBottom: 2 },
  gradArchiveLinkText: { fontFamily: Fonts.bodyMedium, fontSize: FontSizes.sm, color: 'rgba(255,255,255,0.85)' },

  // Daily Compass widget (Days 16–21)
  compassCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    borderWidth: 1.5,
    borderColor: Colors.goldBorder,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  compassLabel: {
    fontFamily: Fonts.bodyBold,
    fontSize: FontSizes.xs,
    color: Colors.goldText,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  compassBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  compassBadge: {
    backgroundColor: Colors.goldLight,
    borderRadius: Radius.tag,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  compassBadgeText: {
    fontFamily: Fonts.bodyBold,
    fontSize: FontSizes.xs,
    color: Colors.goldText,
  },

  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: -4 },
  sectionLabel: { fontFamily: Fonts.bodyBold, fontSize: FontSizes.base, color: Colors.ink },
  sectionViewAll: { fontFamily: Fonts.bodyMedium, fontSize: FontSizes.sm, color: Colors.tideMid },

  toolGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  toolCardWrapper: { width: '48%' },
  toolCard: {
    backgroundColor: Colors.white, borderRadius: Radius.card,
    padding: 14, borderWidth: 1, borderColor: Colors.sandBorder, gap: 8, ...Shadows.card,
  },
  toolIconBox: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  toolName: { fontFamily: Fonts.bodyBold, fontSize: 12, color: Colors.ink, lineHeight: 16 },
  toolSub:  { fontFamily: Fonts.body, fontSize: FontSizes.xs, color: Colors.inkMuted },

  victoryCard: {
    backgroundColor: Colors.goldLight, borderRadius: Radius.sm,
    borderLeftWidth: 3, borderLeftColor: Colors.gold,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: 4,
  },
  victoryMoodBadge: {
    backgroundColor: Colors.goldBorder, borderRadius: Radius.tag,
    alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2,
  },
  victoryMoodText: { fontSize: FontSizes.xs, fontFamily: Fonts.bodyBold, color: Colors.goldText, textTransform: 'uppercase' },
  victoryText: { fontSize: FontSizes.base, fontFamily: Fonts.displayItalic, color: Colors.inkSoft },
  victoryDate: { fontSize: FontSizes.xs, fontFamily: Fonts.mono, color: Colors.inkFaint },
  viewAllBtn: { alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 20, borderRadius: Radius.tag, backgroundColor: Colors.tideLight },
  viewAllText: { fontFamily: Fonts.bodyMedium, fontSize: FontSizes.sm, color: Colors.tide },

  exitZen: {
    position: 'absolute', right: Spacing.lg, zIndex: 10,
    backgroundColor: Colors.gold, borderRadius: Radius.tag,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  exitZenText: { color: Colors.white, fontFamily: Fonts.bodyBold },
  zenContent:  { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.lg, gap: Spacing.md },
  zenDay:      { fontFamily: Fonts.bodyBold, fontSize: FontSizes.base, color: Colors.tide, textTransform: 'uppercase' },
  zenTitle:    { fontFamily: Fonts.displayItalic, fontSize: FontSizes['3xl'], color: Colors.ink, lineHeight: 44 },
  zenScience:  { fontFamily: Fonts.body, fontSize: FontSizes.base, color: Colors.inkMuted, lineHeight: 26 },
});
