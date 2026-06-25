import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence,
  cancelAnimation, Easing as REasing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../../constants/colors';
import { Fonts, FontSizes } from '../../../constants/typography';
import { Spacing } from '../../../constants/spacing';

const { width: W } = Dimensions.get('window');
const RING_SIZE   = W * 0.72;
const RING_STROKE = 5;

const WORK_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

/**
 * Pure RN sweeping arc — two half-disc masks rotated around the center.
 * Works in Expo Go (no NitroModules).
 */
function ProgressRing({
  progress, // 0→1
  color,
  size,
  stroke,
}: {
  progress: number;
  color: string;
  size: number;
  stroke: number;
}) {
  const r = size / 2;
  // Clamp to [0,1]
  const p = Math.min(1, Math.max(0, progress));
  // Left half fills for first 50%, right half fills for second 50%
  const leftDeg = p <= 0.5 ? p * 360 : 180;
  const rightDeg = p > 0.5 ? (p - 0.5) * 360 : 0;

  return (
    <View style={{ width: size, height: size }}>
      {/* Track ring */}
      <View
        style={{
          position: 'absolute', width: size, height: size,
          borderRadius: r, borderWidth: stroke,
          borderColor: 'rgba(255,255,255,0.08)',
        }}
      />

      {/* Right-side sweep (first 0→50%) */}
      <View style={{ position: 'absolute', width: size, height: size, overflow: 'hidden' }}>
        <View
          style={{
            position: 'absolute', width: r, height: size,
            right: 0, overflow: 'hidden',
          }}
        >
          <View
            style={{
              position: 'absolute', width: size, height: size,
              borderRadius: r, borderWidth: stroke,
              borderColor: color,
              borderLeftColor: 'transparent',
              borderBottomColor: rightDeg >= 90 ? color : 'transparent',
              transform: [{ rotate: `${rightDeg - 90}deg` }],
              left: -r,
            }}
          />
        </View>
      </View>

      {/* Left-side sweep (second 50→100%) */}
      {p > 0.5 && (
        <View style={{ position: 'absolute', width: size, height: size, overflow: 'hidden' }}>
          <View
            style={{
              position: 'absolute', width: r, height: size,
              left: 0, overflow: 'hidden',
            }}
          >
            <View
              style={{
                position: 'absolute', width: size, height: size,
                borderRadius: r, borderWidth: stroke,
                borderColor: color,
                borderRightColor: 'transparent',
                borderTopColor: leftDeg >= 90 ? color : 'transparent',
                transform: [{ rotate: `${leftDeg - 90}deg` }],
                left: 0,
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
}

export default function PomodoroScreen() {
  const router = useRouter();
  const [seconds, setSeconds] = useState(WORK_SECONDS);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [breakMode, setBreakMode] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = breakMode ? BREAK_SECONDS : WORK_SECONDS;
  const progress  = (totalSeconds - seconds) / totalSeconds;
  const nearEnd   = !breakMode && seconds <= 5 * 60 && running;
  const ringColor = nearEnd ? Colors.gold : breakMode ? Colors.success : Colors.tide;

  // Halo animation
  const haloScale   = useSharedValue(1);
  const haloOpacity = useSharedValue(0);
  const digitOpacity = useSharedValue(1);

  useEffect(() => {
    if (running) {
      haloOpacity.value = withTiming(1, { duration: 600 });
      haloScale.value = withRepeat(
        withSequence(
          withTiming(1.06, { duration: 2000, easing: REasing.inOut(REasing.sin) }),
          withTiming(0.97, { duration: 2000, easing: REasing.inOut(REasing.sin) }),
        ),
        -1, false,
      );
    } else {
      haloOpacity.value = withTiming(0, { duration: 400 });
      cancelAnimation(haloScale);
      haloScale.value = withTiming(1, { duration: 300 });
    }
  }, [running]);

  const haloStyle = useAnimatedStyle(() => ({
    transform: [{ scale: haloScale.value }],
    opacity: haloOpacity.value,
  }));
  const digitStyle = useAnimatedStyle(() => ({ opacity: digitOpacity.value }));

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        // Digit tick
        digitOpacity.value = withSequence(
          withTiming(0.72, { duration: 60 }),
          withTiming(1,    { duration: 140 }),
        );
        setSeconds((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            setDone(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');

  const handleReset = () => {
    setRunning(false);
    setSeconds(WORK_SECONDS);
    setDone(false);
    setBreakMode(false);
  };

  const handleStartBreak = () => {
    setSeconds(BREAK_SECONDS);
    setDone(false);
    setBreakMode(true);
    setRunning(true);
  };

  const handleBack = () => {
    if (running) {
      Alert.alert('Leave focus block?', 'Your progress will be lost.', [
        { text: 'Stay focused', style: 'cancel' },
        { text: 'Leave', style: 'destructive', onPress: () => router.back() },
      ]);
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.container, breakMode && styles.containerBreak]}>
      <StatusBar hidden={running} />

      <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
        <Text style={[styles.backText, running && styles.backTextDim]}>← Back</Text>
      </TouchableOpacity>

      <MotiView
        key={breakMode ? 'break' : 'focus'}
        from={{ opacity: 0, translateY: -8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500 }}
        style={styles.header}
      >
        <Text style={[styles.modeLabel, { color: ringColor }]}>
          {breakMode ? '5-MIN BREAK' : 'FOCUS BLOCK'}
        </Text>
        <Text style={styles.subtitle}>
          {breakMode
            ? 'Step away. You earned it.'
            : running
              ? 'In the zone. Do not disturb.'
              : 'For the next 25 minutes, you will have a breakthrough.'}
        </Text>
      </MotiView>

      {/* Progress ring */}
      <View style={styles.ringContainer}>
        {/* Breathing halo — behind ring */}
        <Animated.View
          style={[haloStyle, {
            position: 'absolute',
            width: RING_SIZE, height: RING_SIZE,
            borderRadius: RING_SIZE / 2,
            backgroundColor: ringColor + '18',
          }]}
          pointerEvents="none"
        />
        <ProgressRing
          progress={progress}
          color={ringColor}
          size={RING_SIZE}
          stroke={RING_STROKE}
        />
        <View style={styles.timerInner}>
          <Animated.View style={digitStyle}>
            <Text style={styles.timerText}>{mins}:{secs}</Text>
          </Animated.View>
          <Text style={styles.timerSub}>{breakMode ? 'break' : 'remaining'}</Text>
        </View>
      </View>

      {done && !breakMode && (
        <MotiView from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring' }}>
          <Text style={styles.doneMsg}>25 minutes. That's real work.</Text>
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#059669' }]} onPress={handleStartBreak}>
            <Text style={styles.btnText}>Start 5-min break →</Text>
          </TouchableOpacity>
        </MotiView>
      )}

      {done && breakMode && (
        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Text style={styles.doneMsg}>Break's over. Ready for another block?</Text>
          <TouchableOpacity style={styles.btn} onPress={handleReset}>
            <Text style={styles.btnText}>New focus block →</Text>
          </TouchableOpacity>
        </MotiView>
      )}

      {!done && (
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.btn, running && styles.btnPause]}
            onPress={() => setRunning((r) => !r)}
          >
            <Text style={styles.btnText}>{running ? 'Pause' : 'Start'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnOutline} onPress={handleReset}>
            <Text style={[styles.btnOutlineText, running && { color: 'rgba(255,255,255,0.3)' }]}>Reset</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071A34',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
  },
  containerBreak: { backgroundColor: '#0a1f0e' },
  backBtn: { alignSelf: 'flex-start', marginBottom: Spacing.lg },
  backText: { color: Colors.primaryBlue, fontSize: FontSizes.base, fontWeight: '500' },
  backTextDim: { color: 'rgba(255,255,255,0.2)' },
  header: { alignItems: 'center', marginBottom: Spacing.lg, gap: 6 },
  modeLabel: {
    fontSize: FontSizes.xs, fontFamily: Fonts.mono, letterSpacing: 3, fontWeight: '700',
  },
  subtitle: {
    fontSize: FontSizes.sm, fontFamily: Fonts.displayLightItalic,
    color: 'rgba(255,255,255,0.35)', textAlign: 'center', lineHeight: 22,
  },
  ringContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  timerInner: {
    position: 'absolute',
    alignItems: 'center',
    gap: 4,
  },
  timerText: {
    fontSize: FontSizes.mono,
    fontFamily: Fonts.mono,
    color: Colors.white,
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  timerSub: {
    fontSize: FontSizes.xs, color: 'rgba(255,255,255,0.3)',
    fontFamily: Fonts.mono, letterSpacing: 2,
  },
  doneMsg: {
    fontSize: FontSizes.lg, color: 'rgba(255,255,255,0.75)',
    fontFamily: Fonts.displayItalic,
    textAlign: 'center', marginBottom: Spacing.lg, lineHeight: 28,
  },
  controls: { flexDirection: 'row', gap: Spacing.md },
  btn: {
    backgroundColor: Colors.primaryBlue, borderRadius: 999,
    height: 56, minWidth: 160, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24,
  },
  btnPause: { backgroundColor: Colors.amber },
  btnText: { color: Colors.white, fontWeight: '700', fontSize: FontSizes.base },
  btnOutline: {
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 999,
    height: 56, minWidth: 120, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24,
  },
  btnOutlineText: { color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: FontSizes.base },
});
