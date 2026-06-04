import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useToolStore } from '../../store/useToolStore';
import { Colors } from '../../constants/colors';
import { FontSizes } from '../../constants/typography';
import { Spacing, Radius } from '../../constants/spacing';

export default function AttentionStealers() {
  const { logStealer, topStealers } = useToolStore();
  const [input, setInput] = useState('');
  const top = topStealers();
  const maxCount = top[0]?.count ?? 1;

  const handleLog = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    await logStealer(trimmed);
    setInput('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attention Stealers</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="What stole your attention?"
          placeholderTextColor={Colors.mutedTeal}
          value={input}
          onChangeText={setInput}
          returnKeyType="done"
          onSubmitEditing={handleLog}
        />
        <TouchableOpacity style={styles.logBtn} onPress={handleLog}>
          <Text style={styles.logBtnText}>Log</Text>
        </TouchableOpacity>
      </View>
      {top.map((s) => (
        <View key={s.label} style={styles.barRow}>
          <Text style={styles.barLabel} numberOfLines={1}>{s.label}</Text>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${(s.count / maxCount) * 100}%` }]} />
          </View>
          <Text style={styles.barCount}>{s.count}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  title: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.darkNavy },
  inputRow: { flexDirection: 'row', gap: Spacing.sm },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.lightBlue,
    borderRadius: Radius.button,
    paddingHorizontal: Spacing.md,
    fontSize: FontSizes.base,
    color: Colors.darkNavy,
    backgroundColor: Colors.white,
  },
  logBtn: {
    backgroundColor: Colors.amber,
    borderRadius: Radius.button,
    paddingHorizontal: Spacing.md,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logBtnText: { color: Colors.white, fontWeight: '600' },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barLabel: { width: 100, fontSize: FontSizes.xs, color: Colors.mutedTeal },
  barTrack: { flex: 1, height: 8, backgroundColor: Colors.lightBlue, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, backgroundColor: Colors.amber, borderRadius: 4 },
  barCount: { fontSize: FontSizes.xs, color: Colors.mutedTeal, width: 20, textAlign: 'right' },
});
