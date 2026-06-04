import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import { FontSizes } from '../../constants/typography';
import { Spacing, Radius } from '../../constants/spacing';
import { useUserStore, StuckPattern } from '../../store/useUserStore';
import ProgressDots from '../../components/ui/ProgressDots';

const OPTIONS: { emoji: string; title: string; sub: string; value: StuckPattern }[] = [
  { emoji: '🌀', title: "I keep starting over.", sub: "I build momentum, then lose it. Over and over.", value: 'restart_loop' },
  { emoji: '💭', title: "My mind won't quiet down.", sub: "I'm overwhelmed, anxious, or running on empty.", value: 'overwhelm' },
  { emoji: '📵', title: "I can't focus on what actually matters.", sub: "Distractions win. My best work never happens.", value: 'focus' },
  { emoji: '🔋', title: "I've lost my sense of direction.", sub: "I'm going through the motions but feel disconnected.", value: 'direction' },
  { emoji: '🔥', title: "Everything feels urgent but nothing moves forward.", sub: "I'm busy but not productive. Spinning in place.", value: 'urgency' },
];

export default function Diagnosis() {
  const router = useRouter();
  const setOnboardingField = useUserStore((s) => s.setOnboardingField);
  const [selected, setSelected] = useState<StuckPattern | null>(null);

  const handleSelect = (value: StuckPattern) => {
    setSelected(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setOnboardingField('stuck_pattern', value);
  };

  const handleNext = () => router.push('/(auth)/goal');

  return (
    <View style={styles.container}>
      <ProgressDots total={5} current={2} style={styles.dots} />
      <Text style={styles.headline}>Where do you feel most stuck right now?</Text>
      <Text style={styles.subtext}>Tap the one that hits closest.</Text>
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {OPTIONS.map((opt) => {
          const isSelected = selected === opt.value;
          const isDimmed = selected !== null && !isSelected;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[styles.card, isSelected && styles.cardSelected, isDimmed && styles.cardDimmed]}
              onPress={() => handleSelect(opt.value)}
              activeOpacity={0.8}
            >
              <Text style={styles.emoji}>{opt.emoji}</Text>
              <View style={styles.cardText}>
                <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>{opt.title}</Text>
                <Text style={styles.cardSub}>{opt.sub}</Text>
              </View>
              {isSelected && <Text style={styles.check}>✓</Text>}
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 120 }} />
      </ScrollView>

      {selected && (
        <MotiView
          from={{ opacity: 0, translateY: 24 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 400 }}
          style={styles.ctaWrapper}
        >
          <TouchableOpacity style={styles.cta} onPress={handleNext} activeOpacity={0.85}>
            <Text style={styles.ctaText}>That's the one. →</Text>
          </TouchableOpacity>
        </MotiView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkNavy, paddingHorizontal: Spacing.lg, paddingTop: 60 },
  dots: { marginBottom: Spacing.lg },
  headline: { color: Colors.white, fontSize: FontSizes['2xl'], fontWeight: '600', marginBottom: Spacing.sm, lineHeight: 36 },
  subtext: { color: Colors.white75, fontSize: FontSizes.sm, marginBottom: Spacing.lg },
  list: { flex: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white08,
    borderWidth: 1,
    borderColor: Colors.white12,
    borderRadius: Radius.button,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  cardSelected: {
    borderColor: Colors.primaryBlue,
    borderLeftWidth: 4,
  },
  cardDimmed: { opacity: 0.6 },
  emoji: { fontSize: 24, width: 32, textAlign: 'center' },
  cardText: { flex: 1 },
  cardTitle: { color: Colors.white, fontSize: FontSizes.base, fontWeight: '600' },
  cardTitleSelected: { color: Colors.primaryBlue },
  cardSub: { color: Colors.white75, fontSize: FontSizes.xs, marginTop: 2 },
  check: { color: Colors.primaryBlue, fontSize: FontSizes.base, fontWeight: '700' },
  ctaWrapper: { position: 'absolute', bottom: 40, left: Spacing.lg, right: Spacing.lg },
  cta: {
    backgroundColor: Colors.primaryBlue,
    borderRadius: Radius.tag,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primaryBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaText: { color: Colors.white, fontSize: FontSizes.base, fontWeight: '600' },
});
