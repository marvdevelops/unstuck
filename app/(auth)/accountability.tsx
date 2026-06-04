import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import { FontSizes } from '../../constants/typography';
import { Spacing, Radius } from '../../constants/spacing';
import { useUserStore, AccountabilityStyle } from '../../store/useUserStore';
import ProgressDots from '../../components/ui/ProgressDots';

const OPTIONS: { emoji: string; title: string; sub: string; value: AccountabilityStyle }[] = [
  { emoji: '🦅', title: "On my own.", sub: "I'm self-motivated. I just need the right system.", value: 'solo' },
  { emoji: '👥', title: "With a community around me.", sub: "Knowing others are doing it with me keeps me going.", value: 'community' },
  { emoji: '🎯', title: "With direct accountability.", sub: "I need someone checking in. I work best under structure.", value: 'direct' },
  { emoji: '⚡', title: "It depends on where I am.", sub: "Some seasons I'm solo. Others I need support.", value: 'flexible' },
];

export default function Accountability() {
  const router = useRouter();
  const setOnboardingField = useUserStore((s) => s.setOnboardingField);
  const [selected, setSelected] = useState<AccountabilityStyle | null>(null);

  const handleSelect = (value: AccountabilityStyle) => {
    setSelected(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setOnboardingField('accountability_style', value);
  };

  return (
    <View style={styles.container}>
      <ProgressDots total={5} current={4} style={styles.dots} />
      <Text style={styles.headline}>How do you work best?</Text>
      <Text style={styles.subtext}>Be honest — there's no wrong answer.</Text>
      <View style={styles.list}>
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
      </View>

      {selected && (
        <MotiView
          from={{ opacity: 0, translateY: 24 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 400 }}
          style={styles.ctaWrapper}
        >
          <TouchableOpacity style={styles.cta} onPress={() => router.push('/(auth)/commitment')} activeOpacity={0.85}>
            <Text style={styles.ctaText}>That's me. →</Text>
          </TouchableOpacity>
        </MotiView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkNavy, paddingHorizontal: Spacing.lg, paddingTop: 60, paddingBottom: 40 },
  dots: { marginBottom: Spacing.lg },
  headline: { color: Colors.white, fontSize: FontSizes['2xl'], fontWeight: '600', marginBottom: Spacing.sm, lineHeight: 36 },
  subtext: { color: Colors.white75, fontSize: FontSizes.sm, marginBottom: Spacing.lg },
  list: { flex: 1, gap: Spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white08,
    borderWidth: 1,
    borderColor: Colors.white12,
    borderRadius: Radius.button,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  cardSelected: { borderColor: Colors.primaryBlue, borderLeftWidth: 4 },
  cardDimmed: { opacity: 0.6 },
  emoji: { fontSize: 24, width: 32, textAlign: 'center' },
  cardText: { flex: 1 },
  cardTitle: { color: Colors.white, fontSize: FontSizes.base, fontWeight: '600' },
  cardTitleSelected: { color: Colors.primaryBlue },
  cardSub: { color: Colors.white75, fontSize: FontSizes.xs, marginTop: 2 },
  check: { color: Colors.primaryBlue, fontSize: FontSizes.base, fontWeight: '700' },
  ctaWrapper: { marginTop: Spacing.lg },
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
