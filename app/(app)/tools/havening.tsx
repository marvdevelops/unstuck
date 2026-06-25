import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MotiView, MotiText } from 'moti';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withSequence,
  withTiming, withDelay, interpolateColor, Easing as REasing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../../constants/colors';
import { Fonts, FontSizes } from '../../../constants/typography';
import { Spacing } from '../../../constants/spacing';

const { width: W, height: H } = Dimensions.get('window');

type Phase = 'grounding' | 'arms' | 'face' | 'palms' | 'rest';

const PHASES: { key: Phase; duration: number; title: string; instruction: string; color: string }[] = [
  { key: 'grounding', duration: 5000, title: 'Get ready', instruction: 'Close your eyes.\nCross your arms.', color: '#0F7BD6' },
  { key: 'arms',      duration: 90000, title: 'Shoulders to Elbows', instruction: 'Stroke downward\ngently...', color: '#6366F1' },
  { key: 'face',      duration: 60000, title: 'Under Your Eyes', instruction: 'Sweep across your\ncheekbones...', color: '#7C3AED' },
  { key: 'palms',     duration: 60000, title: 'Your Palms', instruction: 'Circle your palms\nslowly...', color: '#0891B2' },
  { key: 'rest',      duration: 9999999, title: 'Rest', instruction: 'Stay here as long\nas you need.', color: '#059669' },
];

export default function HaveningScreen() {
  const router = useRouter();
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [showExit, setShowExit] = useState(false);
  const strokeY = useSharedValue(0);
  const bgProgress = useSharedValue(0);

  const current = PHASES[phaseIdx];

  useEffect(() => {
    // Advance through phases
    if (phaseIdx < PHASES.length - 1) {
      const timer = setTimeout(() => setPhaseIdx((i) => i + 1), current.duration);
      return () => clearTimeout(timer);
    }
  }, [phaseIdx]);

  useEffect(() => {
    // Show exit after 2 minutes
    const t = setTimeout(() => setShowExit(true), 120000);
    return () => clearTimeout(t);
  }, []);

  // Stroke animation — loops every 3s
  useEffect(() => {
    strokeY.value = 0;
    strokeY.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000, easing: REasing.inOut(REasing.quad) }),
        withTiming(0, { duration: 0 }),
      ),
      -1,
      false,
    );

    // Haptic every 3s in sync with stroke
    const hapticsInterval = setInterval(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 3000);

    return () => clearInterval(hapticsInterval);
  }, [phaseIdx]);

  // Background color drift
  useEffect(() => {
    bgProgress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 8000 }),
        withTiming(0, { duration: 8000 }),
      ),
      -1,
      false,
    );
  }, []);

  const bgStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      bgProgress.value,
      [0, 1],
      ['#0d1b2a', '#1a1040'],
    ),
  }));

  const strokeStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: strokeY.value * 180 }],
    opacity: 1 - strokeY.value * 0.7,
  }));

  return (
    <Animated.View style={[styles.container, bgStyle]}>
      <StatusBar hidden />

      {/* Phase progress bar */}
      <View style={styles.progressBarTrack}>
        <MotiView
          animate={{ width: `${((phaseIdx + 1) / PHASES.length) * 100}%` as any }}
          transition={{ type: 'timing', duration: 600 }}
          style={[styles.progressBarFill, { backgroundColor: current.color }]}
        />
      </View>

      <MotiText
        key={current.key + 'label'}
        from={{ opacity: 0, translateY: -10 }}
        animate={{ opacity: 0.7, translateY: 0 }}
        transition={{ type: 'timing', duration: 600 }}
        style={styles.phaseLabel}
      >
        {current.title}
      </MotiText>

      {/* Visual — stroke area */}
      <View style={styles.strokeArea}>
        {/* Background arms silhouette */}
        <View style={[styles.armSilhouette, { borderColor: current.color + '33' }]}>
          {/* Trail (behind) */}
          <Animated.View style={[styles.strokeBarTrail, strokeStyle]}>
            <LinearGradient colors={[current.color + '30', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
          </Animated.View>
          {/* Main stroke */}
          <Animated.View style={[styles.strokeBar, { shadowColor: current.color }, strokeStyle]}>
            <LinearGradient colors={[current.color, current.color + '60']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
          </Animated.View>
        </View>
      </View>

      <MotiText
        key={current.key + 'inst'}
        from={{ opacity: 0, translateY: 12 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 800, delay: 200 }}
        style={styles.instruction}
      >
        {current.instruction}
      </MotiText>

      {showExit && (
        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 800 }}>
          <TouchableOpacity onPress={() => router.back()} style={styles.exitBtn}>
            <Text style={styles.exitText}>I'm calm</Text>
          </TouchableOpacity>
        </MotiView>
      )}

      {!showExit && (
        <TouchableOpacity onPress={() => router.back()} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  progressBarTrack: {
    position: 'absolute',
    top: 60,
    width: W * 0.55,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 3,
    borderRadius: 2,
  },
  phaseLabel: {
    fontSize: FontSizes.xl,
    fontFamily: Fonts.displayItalic,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: Spacing.xl,
  },
  strokeArea: {
    marginBottom: Spacing['2xl'],
  },
  armSilhouette: {
    width: 120,
    height: 200,
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: 'hidden',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  strokeBar: {
    position: 'absolute',
    top: 0,
    width: 72,
    height: 12,
    borderRadius: 6,
    shadowColor: Colors.tide,
    shadowRadius: 12,
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  strokeBarTrail: {
    position: 'absolute',
    top: -8,
    width: 60,
    height: 28,
    borderRadius: 14,
  },
  instruction: {
    fontSize: FontSizes.xl,
    fontFamily: Fonts.displayItalic,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 48,
  },
  exitBtn: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  exitText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: FontSizes.base,
    fontFamily: Fonts.bodyMedium,
  },
  skipBtn: {
    position: 'absolute',
    bottom: 48,
  },
  skipText: {
    color: 'rgba(255,255,255,0.20)',
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body,
  },
});
