import { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Alert, Modal, Dimensions,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, BookOpen, Star, Lock, Award, Unlock, CheckCircle, Compass } from '../../../lib/icons';
import { useJourneyStore } from '../../../store/useJourneyStore';
import { useToolStore } from '../../../store/useToolStore';
import { useUserStore } from '../../../store/useUserStore';
import { useAuthStore } from '../../../store/useAuthStore';
import UpsellModal from '../../../components/ui/UpsellModal';
import CoreValuesWizard from '../../../components/journey/CoreValuesWizard';
import { sendCompletionNotification } from '../../../lib/notifications';
import { CURRICULUM } from '../../../constants/curriculum';
import { Colors } from '../../../constants/colors';
import { Fonts, FontSizes } from '../../../constants/typography';
import { Spacing, Radius, Shadows } from '../../../constants/spacing';
import ChecklistItem from '../../../components/journey/ChecklistItem';
import VideoPlayer from '../../../components/journey/VideoPlayer';
import Card from '../../../components/ui/Card';

const { width: SCREEN_W } = Dimensions.get('window');

const DAY_JOURNAL_PROMPTS = [
  'What shifted for you today?',
  'Where did you feel resistance?',
  'What are you noticing about yourself?',
  'What went better than expected?',
  'What would you tell yesterday\'s version of you?',
];

export default function DayWorkspace() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dayNum = parseInt(id ?? '1', 10);
  const dayData = CURRICULUM[dayNum - 1];

  const {
    progress, initDay, toggleRoutineTask, toggleSpotTask,
    markVideoWatched, setJournal, saveJournal, markCelebrated,
    isDayComplete, hardStopActive,
  } = useJourneyStore();
  const { logStealer } = useToolStore();
  const stealersLog = useToolStore((s) => s.stealersLog);
  const stealers = Object.entries(stealersLog)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const accountabilityStyle = useUserStore((s) => s.onboarding.accountability_style);
  const coreValues          = useUserStore((s) => s.coreValues);
  const setCoreValues       = useUserStore((s) => s.setCoreValues);
  const userTier = useAuthStore((s) => s.user?.tier ?? 'free');

  // Paywall guard — free users can only access Days 1–5
  const FREE_DAY_LIMIT = 5;
  const [paywallVisible, setPaywallVisible] = useState(false);

  useEffect(() => {
    if (userTier === 'free' && dayNum > FREE_DAY_LIMIT) {
      setPaywallVisible(true);
    }
  }, [dayNum, userTier]);

  const [stealerInput, setStealerInput] = useState('');
  const [stealerFocused, setStealerFocused] = useState(false);
  const [journalFocused, setJournalFocused] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [upsellType, setUpsellType] = useState<'basic' | 'cohort' | 'vip' | null>(null);
  const [wizardVisible, setWizardVisible] = useState(false);
  const confettiRef = useRef<ConfettiCannon>(null);

  const promptIndex = dayNum % DAY_JOURNAL_PROMPTS.length;
  const journalPlaceholder = DAY_JOURNAL_PROMPTS[promptIndex];

  useEffect(() => {
    if (dayData) {
      initDay(dayNum, dayData.routine.length, dayData.spot.length);
      // No video for this day — auto-mark watched so it doesn't block completion
      if (!dayData.videoUrl) {
        setTimeout(() => markVideoWatched(dayNum), 100);
      }
    }
  }, [dayNum]);

  const dayState = progress[dayNum];
  const complete = isDayComplete(dayNum);

  if (!dayData || !dayState) return null;

  const handleComplete = async () => {
    if (!complete) return;
    // Show modal + confetti immediately — don't block on API call
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    markCelebrated(dayNum);       // fire-and-forget (syncs to backend in background)
    sendCompletionNotification(dayNum).catch(() => {}); // schedule "reinforcement" push
    setShowModal(true);
    setTimeout(() => confettiRef.current?.start(), 50);

    if (userTier === 'free') {
      if (dayNum === 1) {
        setTimeout(() => setUpsellType('basic'), 3500);
      } else if (dayNum === 3 && (accountabilityStyle === 'community' || accountabilityStyle === 'accountability_partner')) {
        setTimeout(() => setUpsellType('cohort'), 3500);
      } else if (dayNum === 7 && (accountabilityStyle === 'flexible' || accountabilityStyle === 'self_directed')) {
        setTimeout(() => setUpsellType('vip'), 3500);
      }
    }
  };

  const handleLogStealer = async () => {
    const trimmed = stealerInput.trim();
    if (!trimmed) return;
    await logStealer(trimmed);
    setStealerInput('');
  };

  // Day 15 wizard completion — save values + auto-check all spot tasks
  const handleValuesComplete = async (values: string[]) => {
    setWizardVisible(false);
    await setCoreValues(values);
    if (dayState) {
      for (let i = 0; i < dayData.spot.length; i++) {
        if (!dayState.spotTasks[i]) {
          toggleSpotTask(15, i);
        }
      }
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <>
      <KeyboardAwareScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={24}
      >
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={18} color={Colors.tideMid} strokeWidth={2} />
          <Text style={styles.backText}>Dashboard</Text>
        </TouchableOpacity>

        {/* Phase + Title */}
        <View style={styles.phaseRow}>
          <View style={styles.phaseDot} />
          <Text style={styles.phaseLabel}>{dayData.phase}</Text>
        </View>
        <Text style={styles.headline}>Day {dayNum}: {dayData.title}</Text>

        {/* Science — "Why this works" card */}
        <View style={styles.scienceCard}>
          <Text style={styles.scienceLabel}>Why this works</Text>
          <Text style={styles.scienceText}>{dayData.science}</Text>
        </View>

        {/* Video */}
        <View style={styles.videoCard}>
          <VideoPlayer
            uri={dayData.videoUrl}
            dayNum={dayNum}
            watched={dayState.videoWatched}
            onMarkWatched={() => markVideoWatched(dayNum)}
          />
        </View>

        {/* Daily Routine */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Daily routine</Text>
        </View>
        <Card style={styles.checklistCard}>
          {hardStopActive ? (
            <Text style={styles.hardStopNote}>Hard Stop Active — rest is your practice today.</Text>
          ) : (
            dayData.routine.map((task, i) => (
              <ChecklistItem
                key={i}
                label={task}
                checked={dayState.routineTasks[i] ?? false}
                onToggle={() => toggleRoutineTask(dayNum, i)}
              />
            ))
          )}
        </Card>

        {/* Spot Challenge */}
        {dayData.spot.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>Spot challenge</Text>
              <View style={styles.oneTimeBadge}>
                <Text style={styles.oneTimeBadgeText}>One-time</Text>
              </View>
            </View>
            {/* Day 15 — Values Wizard launch button */}
            {dayNum === 15 && !hardStopActive && (
              <TouchableOpacity
                onPress={() => setWizardVisible(true)}
                activeOpacity={0.85}
                style={styles.wizardBtn}
              >
                <LinearGradient
                  colors={coreValues.length > 0 ? [Colors.success, Colors.success] : Colors.gradients.cta}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.wizardBtnInner}
                >
                  <Compass size={16} color={Colors.white} strokeWidth={2} />
                  <Text style={styles.wizardBtnText}>
                    {coreValues.length > 0 ? 'My Core Values ✓' : 'Start Values Discovery →'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            <Card style={styles.checklistCard}>
              {hardStopActive ? (
                <Text style={styles.hardStopNote}>Hard Stop Active — rest first.</Text>
              ) : (
                dayData.spot.map((task, i) => (
                  <ChecklistItem
                    key={i}
                    label={task}
                    checked={dayState.spotTasks[i] ?? false}
                    onToggle={() => toggleSpotTask(dayNum, i)}
                    type="spot"
                  />
                ))
              )}
            </Card>
          </>
        )}

        {/* Attention Stealer */}
        <View style={styles.stealerCard}>
          <Text style={styles.stealerCardLabel}>Did something steal your focus?</Text>
          <View style={styles.stealerRow}>
            <TextInput
              style={[styles.stealerInput, stealerFocused && styles.stealerInputFocused]}
              placeholder="Name it..."
              placeholderTextColor={Colors.inkFaint}
              value={stealerInput}
              onChangeText={setStealerInput}
              returnKeyType="done"
              onSubmitEditing={handleLogStealer}
              onFocus={() => setStealerFocused(true)}
              onBlur={() => setStealerFocused(false)}
            />
            <TouchableOpacity style={styles.stealerBtn} onPress={handleLogStealer}>
              <Text style={styles.stealerBtnText}>Log</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.stealerHint}>Awareness is the first step to control.</Text>

          {stealers.length > 0 && (
            <View style={styles.stealerBars}>
              {stealers.map((s, i) => (
                <View key={s.label} style={styles.stealerBarRow}>
                  <Text style={styles.stealerBarRank}>#{i + 1}</Text>
                  <Text style={styles.stealerBarLabel} numberOfLines={1}>{s.label}</Text>
                  <View style={styles.stealerBarTrack}>
                    <View style={[styles.stealerBarFill, { width: `${(s.count / stealers[0].count) * 100}%` }]} />
                  </View>
                  <Text style={styles.stealerBarCount}>{s.count}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Victory Journal */}
        <Card style={styles.journalCard}>
          <View style={styles.journalHeader}>
            <View style={styles.journalHeaderLeft}>
              <BookOpen size={16} color={Colors.tide} strokeWidth={2} />
              <Text style={styles.journalTitle}>Victory Journal</Text>
            </View>
            <View style={styles.privateBadge}>
              <Text style={styles.privateBadgeText}>🔒 Encrypted</Text>
            </View>
          </View>

          <TextInput
            style={[styles.journalInput, journalFocused && styles.journalInputFocused]}
            multiline
            placeholder={journalPlaceholder}
            placeholderTextColor={Colors.inkFaint}
            value={dayState.journal}
            onChangeText={(t) => setJournal(dayNum, t)}
            onBlur={() => saveJournal(dayNum)}
            onFocus={() => setJournalFocused(true)}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={styles.victoryLogBtn}
            onPress={() => {
              if (dayState.journal.trim()) {
                useToolStore.getState().addVictory({ mood: 'Reflection', text: dayState.journal, date: new Date().toISOString() });
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert('Logged!', 'Added to your Victory Board.');
              }
            }}
          >
            <Star size={14} color={Colors.tide} strokeWidth={2} />
            <Text style={styles.victoryLogBtnText}>Log to Victory Board</Text>
          </TouchableOpacity>
        </Card>

        {/* Complete Button */}
        {complete ? (
          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', damping: 20, delay: 200 }}
          >
            <TouchableOpacity onPress={handleComplete} activeOpacity={0.85}>
              <LinearGradient
                colors={Colors.gradients.cta}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.completeBtn}
              >
                <Text style={styles.completeBtnText}>I completed Day {dayNum}</Text>
                <Award size={18} color={Colors.white} strokeWidth={2} />
              </LinearGradient>
            </TouchableOpacity>
          </MotiView>
        ) : (
          <View style={styles.completeBtnLocked}>
            <Lock size={14} color={Colors.inkFaint} strokeWidth={2} />
            <Text style={styles.completeBtnLockedText}>Complete all tasks to finish</Text>
          </View>
        )}

        <View style={{ height: 80 }} />
      </KeyboardAwareScrollView>

      {upsellType && (
        <UpsellModal
          visible={!!upsellType}
          upsellType={upsellType}
          onDismiss={() => setUpsellType(null)}
        />
      )}

      {/* Paywall — free user on Day 6+ */}
      <UpsellModal
        visible={paywallVisible}
        upsellType="basic"
        onDismiss={() => {
          setPaywallVisible(false);
          router.back();
        }}
      />

      {/* Day 15 — Core Values Wizard */}
      <CoreValuesWizard
        visible={wizardVisible}
        onComplete={handleValuesComplete}
        onClose={() => setWizardVisible(false)}
      />

      {/* Day Complete Modal */}
      <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <ConfettiCannon
            ref={confettiRef}
            count={180}
            origin={{ x: SCREEN_W / 2, y: -20 }}
            autoStart={false}
            fadeOut
            fallSpeed={3000}
            colors={[Colors.tide, Colors.tideMid, Colors.tideDeep, Colors.gold, Colors.white]}
          />

          <MotiView
            from={{ opacity: 0, scale: 0.92, translateY: 24 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            style={styles.modalCard}
          >
            <LinearGradient
              colors={Colors.gradients.ctaGold}
              start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }}
              style={styles.modalMedalWrap}
            >
              <Award size={34} color={Colors.white} strokeWidth={1.5} />
            </LinearGradient>
            <Text style={styles.modalTitle}>Day {dayNum} done.</Text>
            <Text style={styles.modalBody}>
              You showed up. That's the compound effect in motion.
            </Text>

            {dayNum < 21 && (
              <View style={styles.unlockBadge}>
                <Unlock size={14} color={Colors.success} strokeWidth={2} />
                <Text style={styles.unlockText}>Day {dayNum + 1} unlocked</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowModal(false);
                router.replace('/(app)/');
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.modalBtnText}>Back to Dashboard</Text>
            </TouchableOpacity>

            {dayNum < 21 && (
              <TouchableOpacity
                style={styles.modalBtnOutline}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowModal(false);
                  router.replace(`/(app)/day/${dayNum + 1}` as any);
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.modalBtnOutlineText}>Start Day {dayNum + 1} →</Text>
              </TouchableOpacity>
            )}
          </MotiView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.sand },
  content:   { paddingHorizontal: Spacing.lg, paddingTop: 60, gap: Spacing.md },

  // Back
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: Spacing.xs },
  backText: { color: Colors.tideMid, fontSize: FontSizes.sm, fontFamily: Fonts.bodyMedium },

  // Header
  phaseRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  phaseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.tide, marginBottom: 1 },
  phaseLabel: {
    fontSize: FontSizes.xs, fontFamily: Fonts.mono,
    color: Colors.tide, letterSpacing: 2, textTransform: 'uppercase',
  },
  headline: {
    fontSize: FontSizes['3xl'], fontFamily: Fonts.display,
    color: Colors.ink, lineHeight: 42,
  },

  // Science card
  scienceCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.button,
    padding: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: Colors.tide,
  },
  scienceLabel: {
    fontSize: FontSizes.xs, fontFamily: Fonts.bodyBold,
    color: Colors.tide, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6,
  },
  scienceText: {
    fontSize: FontSizes.sm, fontFamily: Fonts.displayLightItalic,
    color: Colors.inkMuted, lineHeight: 24,
  },

  // Video
  videoCard: {
    backgroundColor: Colors.darkBase,
    borderRadius: Radius.card,
    overflow: 'hidden',
  },

  // Section headers
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: -4 },
  sectionLabel: {
    fontSize: FontSizes.base, fontFamily: Fonts.display,
    fontStyle: 'italic', color: Colors.inkMuted,
  },
  oneTimeBadge: {
    backgroundColor: Colors.goldLight, borderRadius: Radius.tag,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: Colors.goldBorder,
  },
  oneTimeBadgeText: { fontSize: FontSizes.xs, fontFamily: Fonts.bodyBold, color: Colors.gold },
  checklistCard: { gap: Spacing.xs },   // 4px between each ChecklistItem row
  hardStopNote: {
    color: Colors.inkMuted, fontSize: FontSizes.sm,
    fontStyle: 'italic', textAlign: 'center', padding: Spacing.sm,
  },
  wizardBtn: {
    marginBottom: Spacing.sm,
    borderRadius: Radius.tag,
    overflow: 'hidden',
  },
  wizardBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: Radius.tag,
  },
  wizardBtnText: {
    fontFamily: Fonts.bodyBold,
    fontSize: FontSizes.base,
    color: Colors.white,
  },

  // Attention stealer
  stealerCard: {
    backgroundColor: Colors.goldLight,
    borderRadius: Radius.card,
    padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.goldBorder,
    gap: 8,
  },
  stealerCardLabel: {
    fontSize: FontSizes.xs, fontFamily: Fonts.bodyBold,
    color: Colors.gold, textTransform: 'uppercase', letterSpacing: 0.8,
  },
  stealerRow: { flexDirection: 'row', gap: Spacing.sm },
  stealerInput: {
    flex: 1, height: 44,
    borderWidth: 1.5, borderColor: Colors.goldBorder,
    borderRadius: Radius.input,
    paddingHorizontal: Spacing.md,
    color: Colors.ink, backgroundColor: Colors.white,
    fontSize: FontSizes.base,
  },
  stealerInputFocused: { borderColor: Colors.gold },
  stealerBtn: {
    backgroundColor: Colors.gold, borderRadius: Radius.input,
    height: 44, paddingHorizontal: Spacing.md,
    alignItems: 'center', justifyContent: 'center',
  },
  stealerBtnText: { color: Colors.white, fontFamily: Fonts.bodyBold, fontSize: FontSizes.sm },
  stealerHint: { fontSize: FontSizes.xs, color: Colors.inkFaint, fontStyle: 'italic' },
  stealerBars: { gap: 6, marginTop: 4 },
  stealerBarRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stealerBarRank: { width: 20, fontSize: FontSizes.xs, fontFamily: Fonts.mono, color: Colors.gold },
  stealerBarLabel: { width: 90, fontSize: FontSizes.xs, fontFamily: Fonts.body, color: Colors.inkMuted },
  stealerBarTrack: { flex: 1, height: 6, backgroundColor: Colors.goldBorder, borderRadius: 3, overflow: 'hidden' },
  stealerBarFill: { height: 6, backgroundColor: Colors.gold, borderRadius: 3 },
  stealerBarCount: { fontSize: FontSizes.xs, fontFamily: Fonts.mono, color: Colors.inkMuted, width: 18, textAlign: 'right' },

  // Journal
  journalCard: { gap: Spacing.sm },
  journalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  journalHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  journalTitle: { fontSize: FontSizes.lg, fontFamily: Fonts.display, color: Colors.ink },
  privateBadge: {},
  privateBadgeText: { fontSize: FontSizes.xs, fontFamily: Fonts.body, color: Colors.inkFaint },
  journalInput: {
    minHeight: 120,
    fontSize: FontSizes.base,
    fontFamily: Fonts.displayItalic,
    color: Colors.ink,
    lineHeight: 28,
    paddingVertical: Spacing.sm,
  },
  journalInputFocused: { minHeight: 160 },
  victoryLogBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: Colors.tideLight,
    borderRadius: Radius.button,
    height: 42,
  },
  victoryLogBtnText: { color: Colors.tide, fontFamily: Fonts.bodyBold, fontSize: FontSizes.sm },

  // Complete button
  completeBtn: {
    borderRadius: Radius.tag,
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    ...Shadows.cta,
  },
  completeBtnText: { color: Colors.white, fontSize: FontSizes.base, fontFamily: Fonts.bodyBold },
  completeBtnLocked: {
    backgroundColor: Colors.sandDeep,
    borderRadius: Radius.tag,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  completeBtnLockedText: { color: Colors.inkFaint, fontSize: FontSizes.base, fontFamily: Fonts.body },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10,20,30,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderRadius: 32,
    padding: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    width: '100%',
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadows.modal,
  },
  modalMedalWrap: {
    width: 72, height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.40,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: FontSizes['3xl'], fontFamily: Fonts.display,
    color: Colors.ink, textAlign: 'center',
  },
  modalBody: {
    fontSize: FontSizes.base, fontFamily: Fonts.body,
    color: Colors.inkMuted, textAlign: 'center', lineHeight: 24,
    marginVertical: Spacing.sm,
  },
  unlockBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.successLight, borderRadius: Radius.tag,
    paddingHorizontal: 16, paddingVertical: 8,
    alignSelf: 'center', marginBottom: Spacing.sm,
  },
  unlockText: { fontSize: FontSizes.sm, fontFamily: Fonts.bodyBold, color: Colors.success },
  modalBtn: {
    backgroundColor: Colors.tide, borderRadius: Radius.button,
    height: 52, width: '100%', alignItems: 'center', justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  modalBtnText: { color: Colors.white, fontSize: FontSizes.base, fontFamily: Fonts.bodyBold },
  modalBtnOutline: {
    borderWidth: 1.5, borderColor: Colors.tide, borderRadius: Radius.button,
    height: 52, width: '100%', alignItems: 'center', justifyContent: 'center',
  },
  modalBtnOutlineText: { color: Colors.tide, fontSize: FontSizes.base, fontFamily: Fonts.bodyBold },
});
