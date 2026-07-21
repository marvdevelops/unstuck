import { useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { ChevronLeft, ChevronRight, Archive as ArchiveIcon } from '../../lib/icons';
import { useArchiveStore } from '../../store/useArchiveStore';
import { Colors } from '../../constants/colors';
import { Fonts, FontSizes } from '../../constants/typography';
import { Spacing, Radius } from '../../constants/spacing';

export default function ArchiveList() {
  const router = useRouter();
  const { archives, loading, fetchArchives } = useArchiveStore();

  useEffect(() => {
    fetchArchives();
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.75}>
        <ChevronLeft size={20} color={Colors.ink} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Past Cycles</Text>
        <Text style={styles.pageSub}>Every 21-day journey you've archived.</Text>

        {loading && archives.length === 0 && (
          <ActivityIndicator color={Colors.tide} style={{ marginTop: Spacing.xl }} />
        )}

        {!loading && archives.length === 0 && (
          <View style={styles.emptyState}>
            <ArchiveIcon size={28} color={Colors.inkFaint} />
            <Text style={styles.emptyText}>No archived cycles yet.</Text>
            <Text style={styles.emptySub}>
              When you complete all 21 days, you can archive your progress before starting again.
            </Text>
          </View>
        )}

        {archives.map((a, i) => {
          const date = new Date(a.archivedAt);
          return (
            <MotiView
              key={a.id}
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 350, delay: i * 50 }}
            >
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/(app)/archive/${a.id}` as any)}
                activeOpacity={0.8}
              >
                <View style={styles.cardIcon}>
                  <ArchiveIcon size={16} color={Colors.tide} strokeWidth={2} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>
                    {date.toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </Text>
                  <Text style={styles.cardSub}>{a.daysCompleted} of 21 days completed</Text>
                </View>
                <ChevronRight size={16} color={Colors.inkFaint} />
              </TouchableOpacity>
            </MotiView>
          );
        })}

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
  content: { paddingHorizontal: Spacing.lg, paddingTop: 108, gap: Spacing.sm },
  pageTitle: { fontSize: FontSizes['2xl'], fontFamily: Fonts.display, color: Colors.ink },
  pageSub: { fontSize: FontSizes.sm, fontFamily: Fonts.body, color: Colors.inkMuted, marginBottom: Spacing.md },

  emptyState: { alignItems: 'center', gap: 8, paddingTop: Spacing.xl, paddingHorizontal: Spacing.lg },
  emptyText: { fontSize: FontSizes.base, fontFamily: Fonts.bodyMedium, color: Colors.inkMuted },
  emptySub: { fontSize: FontSizes.sm, fontFamily: Fonts.body, color: Colors.inkFaint, textAlign: 'center', lineHeight: 20 },

  card: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.sandBorder,
  },
  cardIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.tideLight,
    alignItems: 'center', justifyContent: 'center',
  },
  cardInfo: { flex: 1, gap: 2 },
  cardTitle: { fontSize: FontSizes.base, fontFamily: Fonts.bodyMedium, color: Colors.ink },
  cardSub: { fontSize: FontSizes.xs, fontFamily: Fonts.body, color: Colors.inkMuted },
});
