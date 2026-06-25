import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { ChevronLeft, Sparkles } from '../../lib/icons';
import { useToolStore } from '../../store/useToolStore';
import { Colors } from '../../constants/colors';
import { Fonts, FontSizes } from '../../constants/typography';
import { Spacing, Radius, Shadows } from '../../constants/spacing';
import { stagger } from '../../constants/animations';

export default function VictoriesScreen() {
  const router   = useRouter();
  const victoryLog = useToolStore((s) => s.victoryLog);

  const sorted = [...victoryLog].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* Back */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <ChevronLeft size={18} color={Colors.tideMid} strokeWidth={2} />
        <Text style={styles.backText}>Dashboard</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Your Wins</Text>
      <Text style={styles.subtitle}>
        {sorted.length} {sorted.length === 1 ? 'victory' : 'victories'} logged
      </Text>

      {sorted.length === 0 ? (
        <View style={styles.emptyState}>
          <Sparkles size={44} color={Colors.gold} />
          <Text style={styles.emptyText}>No wins logged yet.</Text>
          <Text style={styles.emptyHint}>Complete a day or use the Release Corner to log your first victory.</Text>
        </View>
      ) : (
        sorted.map((entry, i) => (
          <MotiView
            key={i}
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 360, delay: stagger(i, 40) }}
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <View style={styles.moodBadge}>
                <Text style={styles.moodText}>{entry.mood}</Text>
              </View>
              <Text style={styles.dateText}>
                {new Date(entry.date).toLocaleDateString('en-PH', {
                  weekday: 'short', month: 'short', day: 'numeric',
                })}
              </Text>
            </View>
            <Text style={styles.entryText}>{entry.text}</Text>
          </MotiView>
        ))
      )}

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.sand },
  content:   { paddingHorizontal: Spacing.lg, paddingTop: 60, gap: Spacing.sm },

  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: Spacing.sm },
  backText: { color: Colors.tideMid, fontSize: FontSizes.sm, fontFamily: Fonts.bodyMedium },

  title:    { fontSize: FontSizes['3xl'], fontFamily: Fonts.displayItalic, color: Colors.ink, marginBottom: 2 },
  subtitle: { fontSize: FontSizes.sm, fontFamily: Fonts.body, color: Colors.inkMuted, marginBottom: Spacing.sm },

  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    padding: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.gold,
    gap: 8,
    ...Shadows.card,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  moodBadge: {
    backgroundColor: Colors.goldLight,
    borderRadius: Radius.tag,
    paddingHorizontal: 10, paddingVertical: 3,
    borderWidth: 1, borderColor: Colors.goldBorder,
  },
  moodText: { fontSize: FontSizes.xs, fontFamily: Fonts.bodyBold, color: Colors.goldText, textTransform: 'uppercase' },
  dateText: { fontSize: FontSizes.xs, fontFamily: Fonts.mono, color: Colors.inkFaint },
  entryText: { fontSize: FontSizes.base, fontFamily: Fonts.displayItalic, color: Colors.inkSoft, lineHeight: 26 },

  emptyState: { alignItems: 'center', paddingVertical: Spacing['2xl'], gap: Spacing.sm },
  emptyText:  { fontSize: FontSizes.xl, fontFamily: Fonts.displayItalic, color: Colors.ink },
  emptyHint:  { fontSize: FontSizes.sm, fontFamily: Fonts.body, color: Colors.inkMuted, textAlign: 'center', lineHeight: 22 },
});
