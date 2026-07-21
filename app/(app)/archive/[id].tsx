import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { ChevronLeft, Check, X } from '../../../lib/icons';
import { useArchiveStore } from '../../../store/useArchiveStore';
import { Colors } from '../../../constants/colors';
import { Fonts, FontSizes } from '../../../constants/typography';
import { Spacing, Radius } from '../../../constants/spacing';

export default function ArchiveDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const archive = useArchiveStore((s) => s.getArchive(id ?? ''));

  if (!archive) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.75}>
          <ChevronLeft size={20} color={Colors.ink} />
        </TouchableOpacity>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>This cycle couldn't be loaded.</Text>
        </View>
      </View>
    );
  }

  const { snapshot } = archive;
  const date = new Date(archive.archivedAt);
  const pct = Math.round((archive.daysCompleted / 21) * 100);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.75}>
        <ChevronLeft size={20} color={Colors.ink} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>
          {date.toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}
        </Text>
        <Text style={styles.pageSub}>{archive.daysCompleted} of 21 days completed · {pct}%</Text>

        {snapshot.coreValues.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Core values that cycle</Text>
            <View style={styles.badgeRow}>
              {snapshot.coreValues.map((v) => (
                <View key={v} style={styles.badge}>
                  <Text style={styles.badgeText}>{v}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {snapshot.victoryLog.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Victory log ({snapshot.victoryLog.length})</Text>
            {snapshot.victoryLog.map((entry, i) => (
              <View key={i} style={styles.victoryCard}>
                <View style={styles.victoryMoodBadge}>
                  <Text style={styles.victoryMoodText}>{entry.mood}</Text>
                </View>
                <Text style={styles.victoryText}>{entry.text}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Day by day</Text>
          {snapshot.days.map((d, i) => {
            const complete = d.celebrated;
            return (
              <MotiView
                key={d.day}
                from={{ opacity: 0, translateX: -8 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'timing', duration: 300, delay: i * 20 }}
                style={styles.dayRow}
              >
                <View style={[styles.dayBadge, complete ? styles.dayBadgeDone : styles.dayBadgeSkipped]}>
                  {complete
                    ? <Check size={13} color={Colors.success} strokeWidth={3} />
                    : <X size={13} color={Colors.inkFaint} strokeWidth={2} />
                  }
                </View>
                <View style={styles.dayInfo}>
                  <Text style={styles.dayTitle}>Day {d.day}: {d.title}</Text>
                  {d.journal.trim().length > 0 && (
                    <Text style={styles.dayJournal} numberOfLines={4}>{d.journal}</Text>
                  )}
                </View>
              </MotiView>
            );
          })}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.sand },
  backBtn: {
    position: 'absolute', top: 56, left: Spacing.lg, zIndex: 10,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.sandBorder,
  },
  content: { paddingHorizontal: Spacing.lg, paddingTop: 108, gap: Spacing.md },
  pageTitle: { fontSize: FontSizes['2xl'], fontFamily: Fonts.display, color: Colors.ink },
  pageSub: { fontSize: FontSizes.sm, fontFamily: Fonts.body, color: Colors.inkMuted, marginTop: -4 },

  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontSize: FontSizes.base, fontFamily: Fonts.body, color: Colors.inkMuted },

  section: { gap: Spacing.sm },
  sectionLabel: { fontSize: FontSizes.xs, fontFamily: Fonts.bodyMedium, color: Colors.inkMuted, textTransform: 'uppercase', letterSpacing: 0.6 },

  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: {
    backgroundColor: Colors.goldLight, borderRadius: Radius.tag,
    borderWidth: 1, borderColor: Colors.goldBorder,
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
  },
  badgeText: { fontFamily: Fonts.bodyBold, fontSize: FontSizes.xs, color: Colors.goldText },

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

  dayRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1, borderBottomColor: Colors.sandBorder,
  },
  dayBadge: {
    width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
  },
  dayBadgeDone: { backgroundColor: Colors.successLight },
  dayBadgeSkipped: { backgroundColor: Colors.sandDeep },
  dayInfo: { flex: 1, gap: 2 },
  dayTitle: { fontSize: FontSizes.sm, fontFamily: Fonts.bodyMedium, color: Colors.ink },
  dayJournal: { fontSize: FontSizes.xs, fontFamily: Fonts.body, color: Colors.inkMuted, lineHeight: 18, fontStyle: 'italic' },
});
