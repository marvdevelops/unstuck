import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { useUserStore } from '../../store/useUserStore';
import { useJourneyStore } from '../../store/useJourneyStore';
import { useToolStore } from '../../store/useToolStore';
import { CURRICULUM } from '../../constants/curriculum';
import { Colors } from '../../constants/colors';
import { Fonts, FontSizes } from '../../constants/typography';
import { Spacing, Radius, Shadows } from '../../constants/spacing';
import AttentionStealers from '../../components/dashboard/AttentionStealers';
import Card from '../../components/ui/Card';

export default function Dashboard() {
  const router = useRouter();
  const firstName = useUserStore((s) => s.onboarding.first_name ?? 'there');
  const { progress, hardStopActive, isDayComplete, isDayUnlocked } = useJourneyStore();
  const { zenMode, victoryLog } = useToolStore();

  // Find the current active day
  const currentDay = CURRICULUM.findIndex((d) => !isDayComplete(d.day)) + 1 || 21;
  const dayData = CURRICULUM[currentDay - 1];
  const completedCount = CURRICULUM.filter((d) => isDayComplete(d.day)).length;
  const progressPct = Math.round((completedCount / 21) * 100);

  if (zenMode) {
    return (
      <View style={[styles.container, { backgroundColor: Colors.white }]}>
        <TouchableOpacity style={styles.exitZen} onPress={() => useToolStore.getState().toggleZenMode()}>
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.greeting}>Welcome back, {firstName}.</Text>
        <View style={styles.progressPill}>
          <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
          <Text style={styles.progressText}>{progressPct}%</Text>
        </View>
      </View>

      {/* Hero card */}
      <Card style={styles.heroCard}>
        <Text style={styles.heroPhase}>{dayData?.phase}</Text>
        <Text style={styles.heroDay}>Day {currentDay}</Text>
        <Text style={styles.heroTitle}>{dayData?.title}</Text>
        {hardStopActive ? (
          <View style={styles.hardStopMsg}>
            <Text style={styles.hardStopText}>Hard Stop Active. Rest is your only task right now.</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.resumeBtn}
            onPress={() => router.push(`/(app)/day/${currentDay}`)}
            activeOpacity={0.85}
          >
            <Text style={styles.resumeBtnText}>▶ Resume Journey</Text>
          </TouchableOpacity>
        )}
      </Card>

      {/* Toolkit */}
      <Text style={styles.sectionTitle}>Your Limitless Toolkit</Text>
      <View style={styles.toolGrid}>
        {TOOLS.map((tool) => {
          const disabled = hardStopActive && tool.disabledOnHardStop;
          return (
            <TouchableOpacity
              key={tool.id}
              style={[styles.toolCard, disabled && styles.toolCardDisabled]}
              onPress={() => !disabled && router.push(tool.route as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.toolEmoji}>{tool.emoji}</Text>
              <Text style={[styles.toolName, disabled && { opacity: 0.4 }]}>{tool.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Attention Stealers */}
      <Card style={styles.sectionCard}>
        <AttentionStealers />
      </Card>

      {/* Victory Log */}
      <Text style={styles.sectionTitle}>Victory Log</Text>
      {victoryLog.slice(0, 5).map((entry, i) => (
        <Card key={i} style={styles.victoryCard}>
          <Text style={styles.victoryMood}>{entry.mood}</Text>
          <Text style={styles.victoryText}>{entry.text}</Text>
          <Text style={styles.victoryDate}>{new Date(entry.date).toLocaleDateString()}</Text>
        </Card>
      ))}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const TOOLS = [
  { id: 'pomodoro', name: 'Focus Timer', emoji: '⏱', route: '/(app)/tools/pomodoro', disabledOnHardStop: true },
  { id: 'release', name: 'Release Corner', emoji: '🌊', route: '/(app)/tools/release', disabledOnHardStop: false },
  { id: 'batching', name: 'Context Bins', emoji: '🗂', route: '/(app)/tools/batching', disabledOnHardStop: true },
  { id: 'breathing', name: '3-Min Reset', emoji: '🫁', route: '/(app)/tools/breathing', disabledOnHardStop: false },
  { id: 'havening', name: 'Havening', emoji: '🤲', route: '/(app)/tools/havening', disabledOnHardStop: false },
  { id: 'zen', name: 'Zen Mode', emoji: '✨', route: '', disabledOnHardStop: false },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightBlue },
  content: { paddingHorizontal: Spacing.lg, paddingTop: 60, gap: Spacing.md },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: FontSizes.lg, fontFamily: Fonts.bodyMedium, color: Colors.darkNavy, flex: 1 },
  progressPill: {
    height: 8,
    width: 80,
    backgroundColor: Colors.white,
    borderRadius: 4,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressFill: { height: 8, backgroundColor: Colors.primaryBlue, borderRadius: 4 },
  progressText: { display: 'none' },
  heroCard: { backgroundColor: Colors.white },
  heroPhase: { fontSize: FontSizes.xs, fontFamily: Fonts.bodyBold, color: Colors.primaryBlue, textTransform: 'uppercase', letterSpacing: 1 },
  heroDay: { fontSize: FontSizes['2xl'], fontFamily: Fonts.display, color: Colors.darkNavy, marginTop: 4 },
  heroTitle: { fontSize: FontSizes.base, fontFamily: Fonts.body, color: Colors.mutedTeal, marginTop: 4, marginBottom: Spacing.md },
  resumeBtn: {
    backgroundColor: Colors.primaryBlue,
    borderRadius: Radius.tag,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.cta,
  },
  resumeBtnText: { color: Colors.white, fontFamily: Fonts.bodyBold, fontSize: FontSizes.base },
  hardStopMsg: { backgroundColor: Colors.lightBlue, borderRadius: Radius.button, padding: Spacing.md },
  hardStopText: { color: Colors.mutedTeal, fontSize: FontSizes.sm, fontFamily: Fonts.body, textAlign: 'center', lineHeight: 22 },
  sectionTitle: { fontSize: FontSizes.lg, fontFamily: Fonts.bodyBold, color: Colors.darkNavy },
  toolGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  toolCard: {
    width: '30%',
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 8,
    ...Shadows.card,
  },
  toolCardDisabled: { opacity: 0.4 },
  toolEmoji: { fontSize: 28 },
  toolName: { fontSize: FontSizes.xs, fontFamily: Fonts.bodyMedium, color: Colors.darkNavy, textAlign: 'center' },
  sectionCard: {},
  victoryCard: { gap: 4, paddingVertical: 14 },
  victoryMood: { fontSize: FontSizes.xs, fontFamily: Fonts.bodyBold, color: Colors.primaryBlue, textTransform: 'uppercase' },
  victoryText: { fontSize: FontSizes.base, fontFamily: Fonts.body, color: Colors.darkNavy },
  victoryDate: { fontSize: FontSizes.xs, fontFamily: Fonts.body, color: Colors.mutedTeal },
  exitZen: {
    position: 'absolute',
    top: 60,
    right: Spacing.lg,
    backgroundColor: Colors.amber,
    borderRadius: Radius.tag,
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 10,
  },
  exitZenText: { color: Colors.white, fontFamily: Fonts.bodyBold },
  zenContent: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.lg, gap: Spacing.md },
  zenDay: { fontSize: FontSizes.base, fontFamily: Fonts.bodyBold, color: Colors.primaryBlue, textTransform: 'uppercase' },
  zenTitle: { fontSize: FontSizes['3xl'], fontFamily: Fonts.display, color: Colors.darkNavy, lineHeight: 44 },
  zenScience: { fontSize: FontSizes.base, fontFamily: Fonts.body, color: Colors.mutedTeal, lineHeight: 26 },
});
