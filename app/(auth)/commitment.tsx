import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import { FontSizes } from '../../constants/typography';
import { Spacing, Radius } from '../../constants/spacing';
import { useUserStore } from '../../store/useUserStore';
import ProgressDots from '../../components/ui/ProgressDots';

export default function Commitment() {
  const router = useRouter();
  const { setOnboardingField, completeOnboarding } = useUserStore();
  const [name, setName] = useState('');

  const handleStart = async () => {
    if (!name.trim()) return;
    setOnboardingField('first_name', name.trim());
    await completeOnboarding();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace('/(app)/');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Warm amber glow */}
      <MotiView
        from={{ scale: 1, opacity: 0.1 }}
        animate={{ scale: 1.4, opacity: 0.18 }}
        transition={{ type: 'timing', duration: 5000, loop: true, repeatReverse: true }}
        style={styles.glow}
      />

      <ProgressDots total={5} current={5} style={styles.dots} />

      <View style={styles.content}>
        <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ duration: 600 }}>
          <Text style={styles.headline}>One last thing.</Text>
          <Text style={styles.subtext}>What should we call you?</Text>
        </MotiView>

        <TextInput
          style={styles.input}
          placeholder="Type your name..."
          placeholderTextColor={Colors.mutedTeal}
          value={name}
          onChangeText={setName}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleStart}
        />

        {name.trim().length > 0 && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 600 }} style={styles.dynamicText}>
            <Text style={styles.personalMsg}>
              <Text style={styles.nameHighlight}>{name.trim()}</Text>
              {', your 21-day journey starts now.\n\nNot with a grand plan.\nNot with a five-year vision.\n\nWith one breath.\nThree seconds.\nBefore you touch your phone tomorrow morning.\n\nThat\'s Day 1.'}
            </Text>
            <Text style={styles.coachNote}>
              Coach Erik built this because he needed it first.{'\n'}
              He'll be with you every step of the way.
            </Text>
          </MotiView>
        )}
      </View>

      <TouchableOpacity
        style={[styles.cta, !name.trim() && styles.ctaDisabled]}
        onPress={handleStart}
        disabled={!name.trim()}
        activeOpacity={0.85}
      >
        <Text style={styles.ctaText}>I'm starting. Let's go. →</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkNavy, paddingHorizontal: Spacing.lg, paddingTop: 60, paddingBottom: 40 },
  glow: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: Colors.amber,
    top: '20%',
    alignSelf: 'center',
  },
  dots: { marginBottom: Spacing.lg },
  content: { flex: 1, gap: Spacing.lg },
  headline: { color: Colors.white, fontSize: FontSizes['3xl'], fontWeight: '600', lineHeight: 40 },
  subtext: { color: Colors.white75, fontSize: FontSizes.base, marginTop: Spacing.sm },
  input: {
    backgroundColor: Colors.white,
    borderRadius: Radius.input,
    height: 52,
    paddingHorizontal: Spacing.md,
    fontSize: FontSizes.xl,
    color: Colors.darkNavy,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: Colors.primaryBlue,
  },
  dynamicText: { gap: Spacing.md },
  personalMsg: { color: Colors.white75, fontSize: FontSizes.base, lineHeight: 26 },
  nameHighlight: { color: Colors.white, fontWeight: '700' },
  coachNote: { color: Colors.white45, fontSize: FontSizes.sm, lineHeight: 20 },
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
  ctaDisabled: { opacity: 0.4 },
  ctaText: { color: Colors.white, fontSize: FontSizes.base, fontWeight: '600' },
});
