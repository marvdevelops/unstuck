import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { CURRICULUM } from '../../constants/curriculum';
import { useJourneyStore } from '../../store/useJourneyStore';
import { Colors } from '../../constants/colors';
import { FontSizes } from '../../constants/typography';
import { Spacing, Radius, Shadows } from '../../constants/spacing';

export default function JourneyList() {
  const router = useRouter();
  const { isDayComplete, isDayUnlocked } = useJourneyStore();

  const phases = ['Phase 1: Catalyst', 'Phase 2: Ignite', 'Phase 3: Own It'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>Your 21-Day Journey</Text>
      {phases.map((phase) => (
        <View key={phase} style={styles.phaseSection}>
          <Text style={styles.phaseLabel}>{phase}</Text>
          {CURRICULUM.filter((d) => d.phase === phase).map((day) => {
            const complete = isDayComplete(day.day);
            const unlocked = isDayUnlocked(day.day);
            return (
              <TouchableOpacity
                key={day.day}
                style={[styles.dayCard, complete && styles.dayCardComplete, !unlocked && styles.dayCardLocked]}
                onPress={() => unlocked && router.push(`/(app)/day/${day.day}`)}
                activeOpacity={unlocked ? 0.8 : 1}
              >
                <View style={[styles.dayBadge, complete && styles.dayBadgeComplete]}>
                  <Text style={[styles.dayNum, complete && styles.dayNumComplete]}>
                    {complete ? '✓' : day.day}
                  </Text>
                </View>
                <View style={styles.dayInfo}>
                  <Text style={[styles.dayTitle, !unlocked && styles.dimmed]}>{day.title}</Text>
                  <Text style={[styles.dayPhase, !unlocked && styles.dimmed]}>{day.phase}</Text>
                </View>
                {!unlocked && <Text style={styles.lock}>🔒</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightBlue },
  content: { paddingHorizontal: Spacing.lg, paddingTop: 60, gap: Spacing.md },
  pageTitle: { fontSize: FontSizes['2xl'], fontWeight: '700', color: Colors.darkNavy },
  phaseSection: { gap: Spacing.sm },
  phaseLabel: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.primaryBlue, textTransform: 'uppercase', letterSpacing: 1 },
  dayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    padding: Spacing.md,
    gap: Spacing.md,
    ...Shadows.card,
  },
  dayCardComplete: { backgroundColor: '#f0fdf9' },
  dayCardLocked: { opacity: 0.6 },
  dayBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBadgeComplete: { backgroundColor: Colors.successGreen },
  dayNum: { fontSize: FontSizes.base, fontWeight: '700', color: Colors.primaryBlue },
  dayNumComplete: { color: Colors.white },
  dayInfo: { flex: 1 },
  dayTitle: { fontSize: FontSizes.base, fontWeight: '600', color: Colors.darkNavy },
  dayPhase: { fontSize: FontSizes.xs, color: Colors.mutedTeal, marginTop: 2 },
  dimmed: { color: Colors.mutedTeal },
  lock: { fontSize: 16 },
});
