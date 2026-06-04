import { useEffect, useRef, useState } from 'react';
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity,
  TextInput, Alert, Modal, Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useJourneyStore } from '../../../store/useJourneyStore';
import { useToolStore } from '../../../store/useToolStore';
import { useUserStore } from '../../../store/useUserStore';
import { useAuthStore } from '../../../store/useAuthStore';
import UpsellModal from '../../../components/ui/UpsellModal';
import { CURRICULUM } from '../../../constants/curriculum';
import { Colors } from '../../../constants/colors';
import { Fonts, FontSizes } from '../../../constants/typography';
import { Spacing, Radius, Shadows } from '../../../constants/spacing';
import ChecklistItem from '../../../components/journey/ChecklistItem';
import VideoPlayer from '../../../components/journey/VideoPlayer';
import Card from '../../../components/ui/Card';

const { width: SCREEN_W } = Dimensions.get('window');

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

  const accountabilityStyle = useUserStore((s) => s.onboarding.accountability_style);
  const userTier = useAuthStore((s) => s.user?.tier ?? 'free');

  const [stealerInput, setStealerInput] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [upsellType, setUpsellType] = useState<'basic' | 'cohort' | 'vip' | null>(null);
  const confettiRef = useRef<ConfettiCannon>(null);

  useEffect(() => {
    if (dayData) initDay(dayNum, dayData.routine.length, dayData.spot.length);
  }, [dayNum]);

  const dayState = progress[dayNum];
  const complete = isDayComplete(dayNum);

  if (!dayData || !dayState) return null;

  const handleComplete = async () => {
    if (!complete) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await markCelebrated(dayNum);
    setShowModal(true);
    // Fire confetti after modal mounts
    setTimeout(() => confettiRef.current?.start(), 100);

    // Upsell logic — only for free users
    if (userTier === 'free') {
      if (dayNum === 1) {
        // After Day 1: direct upsell for all
        setTimeout(() => setUpsellType('basic'), 2500);
      } else if (dayNum === 3 && (accountabilityStyle === 'community' || accountabilityStyle === 'accountability_partner')) {
        // After Day 3: community upsell for social accountability types
        setTimeout(() => setUpsellType('cohort'), 2500);
      } else if (dayNum === 7 && (accountabilityStyle === 'flexible' || accountabilityStyle === 'self_directed')) {
        // After Day 7: flexible/VIP upsell for self-directed types
        setTimeout(() => setUpsellType('vip'), 2500);
      }
    }
  };

  const handleLogStealer = async () => {
    const trimmed = stealerInput.trim();
    if (!trimmed) return;
    await logStealer(trimmed);
    setStealerInput('');
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back to Dashboard</Text>
        </TouchableOpacity>

        <Text style={styles.phaseLabel}>{dayData.phase}</Text>
        <Text style={styles.headline}>Day {dayNum}: {dayData.title}</Text>
        <Text style={styles.science}>{dayData.science}</Text>

        <Card style={styles.videoCard}>
          <VideoPlayer
            uri={dayData.videoUrl}
            dayNum={dayNum}
            watched={dayState.videoWatched}
            onMarkWatched={() => markVideoWatched(dayNum)}
          />
        </Card>

        {/* Daily Routine */}
        <Text style={styles.sectionHeader}>Daily Routine (Compounding)</Text>
        <Card>
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
            <Text style={styles.sectionHeader}>Today's Spot Challenge (One-Time)</Text>
            <Card>
              {hardStopActive ? (
                <Text style={styles.hardStopNote}>Hard Stop Active — rest first.</Text>
              ) : (
                dayData.spot.map((task, i) => (
                  <ChecklistItem
                    key={i}
                    label={task}
                    checked={dayState.spotTasks[i] ?? false}
                    onToggle={() => toggleSpotTask(dayNum, i)}
                  />
                ))
              )}
            </Card>
          </>
        )}

        {/* Attention Stealer log */}
        <Text style={styles.sectionHeader}>Log an Attention Stealer</Text>
        <View style={styles.stealerRow}>
          <TextInput
            style={styles.stealerInput}
            placeholder="What distracted you?"
            placeholderTextColor={Colors.mutedTeal}
            value={stealerInput}
            onChangeText={setStealerInput}
            returnKeyType="done"
            onSubmitEditing={handleLogStealer}
          />
          <TouchableOpacity style={styles.stealerBtn} onPress={handleLogStealer}>
            <Text style={styles.stealerBtnText}>Log</Text>
          </TouchableOpacity>
        </View>

        {/* Victory Journal */}
        <Text style={styles.sectionHeader}>Victory Journal</Text>
        <Card>
          <TextInput
            style={styles.journalInput}
            multiline
            placeholder="Write your win, reflection, or insight for today..."
            placeholderTextColor={Colors.mutedTeal}
            value={dayState.journal}
            onChangeText={(t) => setJournal(dayNum, t)}
            onBlur={() => saveJournal(dayNum)}
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={styles.victoryLogBtn}
            onPress={() => {
              if (dayState.journal.trim()) {
                useToolStore.getState().addVictory({ mood: 'Reflection', text: dayState.journal, date: new Date().toISOString() });
                Alert.alert('Logged!', 'Added to your Victory Board.');
              }
            }}
          >
            <Text style={styles.victoryLogBtnText}>Log to Victory Board</Text>
          </TouchableOpacity>
        </Card>

        {/* Completion */}
        <TouchableOpacity
          style={[styles.completeBtn, !complete && styles.completeBtnDisabled]}
          onPress={handleComplete}
          disabled={!complete}
          activeOpacity={0.85}
        >
          <Text style={styles.completeBtnText}>
            {complete ? "Yes! I completed today's challenge 🏅" : "Complete all tasks to finish"}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Upsell Modal — shown after confetti completes */}
      {upsellType && (
        <UpsellModal
          visible={!!upsellType}
          upsellType={upsellType}
          onDismiss={() => setUpsellType(null)}
        />
      )}

      {/* Day Complete Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          {/* Confetti fires from center-top */}
          <ConfettiCannon
            ref={confettiRef}
            count={180}
            origin={{ x: SCREEN_W / 2, y: -20 }}
            autoStart={false}
            fadeOut
            fallSpeed={3000}
            colors={[Colors.primaryBlue, Colors.amber, Colors.successGreen, Colors.white, '#F9A8D4']}
          />

          <View style={styles.modalCard}>
            <Text style={styles.modalEmoji}>🏅</Text>
            <Text style={styles.modalTitle}>Day {dayNum} Complete!</Text>
            <Text style={styles.modalSubtitle}>{dayData.title}</Text>
            <Text style={styles.modalBody}>
              You showed up today. That's the real win. Every day you complete compounds into the unstuck life you're building.
            </Text>

            {dayNum < 21 && (
              <Text style={styles.modalNext}>
                Day {dayNum + 1} unlocked 🔓
              </Text>
            )}

            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => {
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
                  setShowModal(false);
                  router.replace(`/(app)/day/${dayNum + 1}` as any);
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.modalBtnOutlineText}>Start Day {dayNum + 1} →</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightBlue },
  content: { paddingHorizontal: Spacing.lg, paddingTop: 60, gap: Spacing.md },
  backBtn: { marginBottom: Spacing.sm },
  backText: { color: Colors.primaryBlue, fontSize: FontSizes.base, fontFamily: Fonts.bodyMedium },
  phaseLabel: { fontSize: FontSizes.xs, fontFamily: Fonts.bodyBold, color: Colors.primaryBlue, textTransform: 'uppercase', letterSpacing: 1 },
  headline: { fontSize: FontSizes['3xl'], fontFamily: Fonts.display, color: Colors.darkNavy, lineHeight: 44 },
  science: { fontSize: FontSizes.base, fontFamily: Fonts.body, color: Colors.mutedTeal, lineHeight: 26 },
  videoCard: { gap: Spacing.sm },
  sectionHeader: { fontSize: FontSizes.base, fontFamily: Fonts.bodyBold, color: Colors.darkNavy, textTransform: 'uppercase', letterSpacing: 0.5 },
  hardStopNote: { color: Colors.mutedTeal, fontSize: FontSizes.sm, fontStyle: 'italic', textAlign: 'center', padding: Spacing.sm },
  stealerRow: { flexDirection: 'row', gap: Spacing.sm },
  stealerInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.amber,
    borderRadius: Radius.button,
    paddingHorizontal: Spacing.md,
    color: Colors.darkNavy,
    backgroundColor: Colors.white,
  },
  stealerBtn: {
    backgroundColor: Colors.amber,
    borderRadius: Radius.button,
    height: 44,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stealerBtnText: { color: Colors.white, fontWeight: '600' },
  journalInput: {
    minHeight: 120,
    fontSize: FontSizes.base,
    color: Colors.darkNavy,
    lineHeight: 24,
  },
  victoryLogBtn: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.successGreen,
    borderRadius: Radius.tag,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  victoryLogBtnText: { color: Colors.white, fontWeight: '600' },
  completeBtn: {
    backgroundColor: Colors.primaryBlue,
    borderRadius: Radius.tag,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.cta,
  },
  completeBtnDisabled: { backgroundColor: Colors.mutedTeal, opacity: 0.5 },
  completeBtnText: { color: Colors.white, fontSize: FontSizes.base, fontWeight: '600', textAlign: 'center', paddingHorizontal: 16 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7,26,52,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderRadius: 28,
    padding: Spacing.xl,
    width: '100%',
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadows.card,
  },
  modalEmoji: { fontSize: 64, marginBottom: 4 },
  modalTitle: {
    fontSize: FontSizes['3xl'],
    fontFamily: Fonts.display,
    color: Colors.darkNavy,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.bodyMedium,
    color: Colors.primaryBlue,
    textAlign: 'center',
  },
  modalBody: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body,
    color: Colors.mutedTeal,
    textAlign: 'center',
    lineHeight: 24,
    marginVertical: Spacing.sm,
  },
  modalNext: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.bodyBold,
    color: Colors.successGreen,
    marginBottom: Spacing.sm,
  },
  modalBtn: {
    backgroundColor: Colors.primaryBlue,
    borderRadius: Radius.button,
    height: 52,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  modalBtnText: { color: Colors.white, fontSize: FontSizes.base, fontFamily: Fonts.bodyBold },
  modalBtnOutline: {
    borderWidth: 2,
    borderColor: Colors.primaryBlue,
    borderRadius: Radius.button,
    height: 52,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnOutlineText: { color: Colors.primaryBlue, fontSize: FontSizes.base, fontFamily: Fonts.bodyBold },
});
