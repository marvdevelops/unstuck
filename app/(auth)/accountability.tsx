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
import { Check, User, Users, Target, Zap } from '../../lib/icons';
import { LinearGradient } from 'expo-linear-gradient';

const OPTIONS: { Icon: React.ComponentType<any>; title: string; sub: string; value: AccountabilityStyle }[] = [
  { Icon: User,   title: "On my own.", sub: "I'm self-motivated. I just need the right system.", value: 'solo' },
  { Icon: Users,  title: "With a community around me.", sub: "Knowing others are doing it with me keeps me going.", value: 'community' },
  { Icon: Target, title: "With direct accountability.", sub: "I need someone checking in. I work best under structure.", value: 'direct' },
  { Icon: Zap,    title: "It depends on where I am.", sub: "Some seasons I'm solo. Others I need support.", value: 'flexible' },
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
          const cardContent = (
            <>
              <View style={styles.iconWrap}>
                <opt.Icon size={20} color={isSelected ? Colors.tideMid : Colors.white75} />
              </View>
              <View style={styles.cardText}>
                <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>{opt.title}</Text>
                <Text style={styles.cardSub}>{opt.sub}</Text>
              </View>
              {isSelected && <Check size={16} color={Colors.tideMid} />}
            </>
          );
          return (
            <TouchableOpacity
              key={opt.value}
              style={isDimmed && styles.cardDimmed}
              onPress={() => handleSelect(opt.value)}
              activeOpacity={0.8}
            >
              {isSelected ? (
                <LinearGradient
                  colors={['rgba(46,110,128,0.32)', 'rgba(46,110,128,0.14)']}
                  style={[styles.card, styles.cardSelected]}
                >
                  {cardContent}
                </LinearGradient>
              ) : (
                <View style={styles.card}>{cardContent}</View>
              )}
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
  cardSelected: { borderColor: Colors.tide + 'AA', borderWidth: 1.5 },
  cardDimmed: { opacity: 0.6 },
  iconWrap: { width: 32, alignItems: 'center' },
  cardText: { flex: 1 },
  cardTitle: { color: Colors.white, fontSize: FontSizes.base, fontWeight: '600' },
  cardTitleSelected: { color: Colors.tideMid },
  cardSub: { color: Colors.white75, fontSize: FontSizes.xs, marginTop: 2 },
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
