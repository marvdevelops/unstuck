import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';
import { Colors } from '../../../constants/colors';
import { FontSizes } from '../../../constants/typography';
import { Spacing } from '../../../constants/spacing';

export default function HaveningScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Havening Touch</Text>
      <Text style={styles.subtitle}>
        Cross your arms. Gently stroke downward from shoulders to elbows.{'\n'}Down-regulate your delta waves.
      </Text>

      <View style={styles.animContainer}>
        <MotiView
          from={{ translateY: 0, opacity: 0.8 }}
          animate={{ translateY: 120, opacity: 0 }}
          transition={{ type: 'timing', duration: 4000, easing: Easing.inOut(Easing.sin), loop: true }}
          style={styles.strokeBar}
        />
      </View>

      <Text style={styles.instruction}>Stroke downward slowly...</Text>
      <Text style={styles.exitHint}>Tap back when you feel calm.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white, paddingHorizontal: Spacing.lg, paddingTop: 60, alignItems: 'center' },
  backBtn: { alignSelf: 'flex-start', marginBottom: Spacing.lg },
  backText: { color: Colors.primaryBlue, fontSize: FontSizes.base, fontWeight: '500' },
  title: { fontSize: FontSizes['2xl'], fontWeight: '700', color: Colors.darkNavy },
  subtitle: { fontSize: FontSizes.sm, color: Colors.mutedTeal, textAlign: 'center', lineHeight: 22, marginTop: 8, marginBottom: Spacing['2xl'] },
  animContainer: {
    width: 128,
    height: 160,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.lightBlue,
    overflow: 'hidden',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 8,
    marginBottom: Spacing.xl,
  },
  strokeBar: {
    width: 80,
    height: 8,
    backgroundColor: Colors.primaryBlue,
    borderRadius: 4,
  },
  instruction: { fontSize: FontSizes.base, color: Colors.primaryBlue, fontWeight: '500' },
  exitHint: { fontSize: FontSizes.xs, color: Colors.mutedTeal, marginTop: Spacing.xl },
});
