import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { Colors } from '../../../constants/colors';
import { FontSizes } from '../../../constants/typography';
import { Spacing, Radius, Shadows } from '../../../constants/spacing';

const WORK_SECONDS = 25 * 60;

export default function PomodoroScreen() {
  const router = useRouter();
  const [seconds, setSeconds] = useState(WORK_SECONDS);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            setDone(true);
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
  const progress = 1 - seconds / WORK_SECONDS;

  const handleReset = () => {
    setRunning(false);
    setSeconds(WORK_SECONDS);
    setDone(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Focus Timer</Text>
      <Text style={styles.subtitle}>
        For the next 25 minutes, you're going to have a breakthrough. Breathe in. Focus.
      </Text>

      <View style={styles.timerContainer}>
        {/* Progress ring placeholder — SVG ring requires react-native-svg */}
        <View style={styles.ring}>
          <Text style={styles.timerText}>{mins}:{secs}</Text>
        </View>
      </View>

      {done ? (
        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 600 }}>
          <Text style={styles.doneMsg}>Focus block complete! Time for a 5-minute break. 🎉</Text>
        </MotiView>
      ) : null}

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.startBtn, running && styles.pauseBtn]}
          onPress={() => setRunning((r) => !r)}
        >
          <Text style={styles.startBtnText}>{running ? 'Pause' : 'Start'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
          <Text style={styles.resetBtnText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white, paddingHorizontal: Spacing.lg, paddingTop: 60, alignItems: 'center' },
  backBtn: { alignSelf: 'flex-start', marginBottom: Spacing.lg },
  backText: { color: Colors.primaryBlue, fontSize: FontSizes.base, fontWeight: '500' },
  title: { fontSize: FontSizes['2xl'], fontWeight: '700', color: Colors.darkNavy, textAlign: 'center' },
  subtitle: { fontSize: FontSizes.sm, color: Colors.mutedTeal, textAlign: 'center', lineHeight: 22, marginTop: 8, marginBottom: Spacing.xl },
  timerContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl },
  ring: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 6,
    borderColor: Colors.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: { fontSize: FontSizes.mono, fontWeight: '700', color: Colors.primaryBlue, fontVariant: ['tabular-nums'] },
  doneMsg: { fontSize: FontSizes.base, color: Colors.successGreen, textAlign: 'center', fontWeight: '600', marginBottom: Spacing.lg },
  buttons: { flexDirection: 'row', gap: Spacing.md },
  startBtn: {
    backgroundColor: Colors.primaryBlue,
    borderRadius: Radius.tag,
    height: 56,
    width: 160,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.cta,
  },
  pauseBtn: { backgroundColor: Colors.amber },
  startBtnText: { color: Colors.white, fontWeight: '600', fontSize: FontSizes.base },
  resetBtn: {
    borderWidth: 1.5,
    borderColor: Colors.mutedTeal,
    borderRadius: Radius.tag,
    height: 56,
    width: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtnText: { color: Colors.mutedTeal, fontWeight: '600', fontSize: FontSizes.base },
});
