import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, interpolateColor,
} from 'react-native-reanimated';
import { ChevronRight } from '../../lib/icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import { Fonts, FontSizes } from '../../constants/typography';
import { Spacing, Radius } from '../../constants/spacing';
import { useUserStore } from '../../store/useUserStore';
import { useTrialStore } from '../../store/useTrialStore';
import ProgressDots from '../../components/ui/ProgressDots';

const { width: W } = Dimensions.get('window');

export default function Commitment() {
  const router = useRouter();
  const { setOnboardingField, completeOnboarding } = useUserStore();
  const markTrialStart = useTrialStore((s) => s.markTrialStart);
  const [name, setName] = useState('');
  const [focused, setFocused] = useState(false);

  const focusProgress = useSharedValue(0);

  const handleFocus = () => {
    setFocused(true);
    focusProgress.value = withTiming(1, { duration: 300 });
  };
  const handleBlur = () => {
    setFocused(false);
    if (!name.trim()) focusProgress.value = withTiming(0, { duration: 300 });
  };

  const inputStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(focusProgress.value, [0, 1], [Colors.sandBorder, Colors.tide]),
  }));

  const handleStart = async () => {
    if (!name.trim()) return;
    setOnboardingField('first_name', name.trim());
    await completeOnboarding();
    await markTrialStart();   // start the 7-day clock on first entry
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace('/(app)/');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Amber glow sphere — top bleed, warm sunrise light */}
      <MotiView
        from={{ scale: 1, opacity: 0.55 }}
        animate={{ scale: 1.18, opacity: 0.80 }}
        transition={{ type: 'timing', duration: 5000, loop: true, repeatReverse: true }}
        style={styles.glow}
      >
        <LinearGradient
          colors={['#E8B45A', '#C8923A', '#A07020']}
          start={{ x: 0.25, y: 0.10 }}
          end={{ x: 0.80, y: 0.90 }}
          style={{ flex: 1, borderRadius: 999 }}
        />
      </MotiView>

      <ProgressDots total={5} current={5} style={styles.dots} />

      <View style={styles.content}>
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 900, delay: 200 }}
        >
          <Text style={styles.headline}>One last thing.</Text>
          <Text style={styles.subtext}>What should we call you?</Text>
        </MotiView>

        <Animated.View style={[styles.inputWrapper, inputStyle]}>
          <TextInput
            style={styles.input}
            placeholder="Type your name..."
            placeholderTextColor={Colors.darkFaint}
            value={name}
            onChangeText={setName}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleStart}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </Animated.View>

        {name.trim().length > 0 && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 900, delay: 200 }}
            style={styles.dynamicText}
          >
            <View style={styles.divider} />

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
        style={[styles.ctaWrap, !name.trim() && styles.ctaDisabled]}
        onPress={handleStart}
        disabled={!name.trim()}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={Colors.gradients.cta}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={styles.cta}
        >
          <Text style={styles.ctaText}>I'm starting. Let's go.</Text>
          <ChevronRight size={18} color={Colors.white} strokeWidth={2.5} />
        </LinearGradient>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkBase,
    paddingHorizontal: Spacing.lg,
    paddingTop: 72,
    paddingBottom: 40,
  },
  glow: {
    position: 'absolute',
    width: W * 1.4, height: W * 1.4,
    borderRadius: W * 0.7,
    top: -W * 0.4,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  dots: { marginBottom: Spacing.lg },
  content: { flex: 1, gap: Spacing.lg },

  headline: {
    color: Colors.white,
    fontSize: FontSizes['4xl'],
    fontFamily: Fonts.display,
    lineHeight: 48,
  },
  subtext: {
    color: Colors.darkMuted,
    fontSize: FontSizes.base,
    fontFamily: Fonts.body,
    marginTop: Spacing.sm,
  },

  inputWrapper: {
    borderWidth: 1.5,
    borderRadius: Radius.input,
    backgroundColor: Colors.sand,
    overflow: 'hidden',
  },
  input: {
    height: 56,
    paddingHorizontal: Spacing.md,
    fontSize: FontSizes.xl,
    fontFamily: Fonts.display,
    color: Colors.ink,
    textAlign: 'center',
  },

  dynamicText: { gap: Spacing.md },
  divider: { height: 1, backgroundColor: Colors.darkBorder, marginVertical: Spacing.sm },
  personalMsg: {
    color: Colors.darkMuted,
    fontSize: FontSizes.base,
    fontFamily: Fonts.body,
    lineHeight: 30,
  },
  nameHighlight: {
    color: Colors.tideMid,
    fontFamily: Fonts.displayItalic,
  },
  coachNote: {
    color: Colors.darkFaint,
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body,
    lineHeight: 22,
  },

  ctaWrap: {
    borderRadius: Radius.tag,
    shadowColor: Colors.tide,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  cta: {
    borderRadius: Radius.tag,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  ctaDisabled: { opacity: 0.35 },
  ctaText: { color: Colors.white, fontSize: FontSizes.base, fontFamily: Fonts.bodyBold },
});
