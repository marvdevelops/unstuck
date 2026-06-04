import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';
import { Colors } from '../../../constants/colors';
import { FontSizes } from '../../../constants/typography';
import { Spacing, Radius } from '../../../constants/spacing';

export default function BreathingScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<'inhale' | 'exhale'>('inhale');

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>3-Minute Reset</Text>
      <Text style={styles.subtitle}>Breathe in as it expands. Breathe out as it shrinks.</Text>

      <View style={styles.orbContainer}>
        {/* Outer ring */}
        <MotiView
          from={{ scale: 1, opacity: 0.4 }}
          animate={{ scale: 1.5, opacity: 0.7 }}
          transition={{ type: 'timing', duration: 4000, easing: Easing.inOut(Easing.sin), loop: true, repeatReverse: true, delay: 500 }}
          style={[styles.orb, styles.orbOuter]}
          onDidAnimate={(key, finished) => {
            if (key === 'scale' && finished) setPhase((p) => p === 'inhale' ? 'exhale' : 'inhale');
          }}
        />
        {/* Middle ring */}
        <MotiView
          from={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.5, opacity: 0.85 }}
          transition={{ type: 'timing', duration: 4000, easing: Easing.inOut(Easing.sin), loop: true, repeatReverse: true }}
          style={[styles.orb, styles.orbMiddle]}
        />
        {/* Center */}
        <View style={[styles.orb, styles.orbCenter]} />
      </View>

      <Text style={styles.phaseText}>{phase === 'inhale' ? 'Inhale...' : 'Exhale...'}</Text>
      <Text style={styles.exitHint}>Tap back when you're ready to return.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white, paddingHorizontal: Spacing.lg, paddingTop: 60, alignItems: 'center' },
  backBtn: { alignSelf: 'flex-start', marginBottom: Spacing.lg },
  backText: { color: Colors.primaryBlue, fontSize: FontSizes.base, fontWeight: '500' },
  title: { fontSize: FontSizes['2xl'], fontWeight: '700', color: Colors.darkNavy },
  subtitle: { fontSize: FontSizes.sm, color: Colors.mutedTeal, textAlign: 'center', lineHeight: 22, marginTop: 8, marginBottom: Spacing['2xl'] },
  orbContainer: { width: 240, height: 240, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl },
  orb: { position: 'absolute', borderRadius: 1000 },
  orbOuter: { width: 160, height: 160, backgroundColor: Colors.lightBlue },
  orbMiddle: { width: 120, height: 120, backgroundColor: Colors.primaryBlue20 },
  orbCenter: { width: 64, height: 64, backgroundColor: Colors.primaryBlue },
  phaseText: { fontSize: FontSizes.xl, color: Colors.primaryBlue, fontStyle: 'italic' },
  exitHint: { fontSize: FontSizes.xs, color: Colors.mutedTeal, marginTop: Spacing.xl },
});
