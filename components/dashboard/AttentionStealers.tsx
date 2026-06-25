import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useToolStore } from '../../store/useToolStore';
import { Colors } from '../../constants/colors';
import { Fonts, FontSizes } from '../../constants/typography';
import { Spacing, Radius } from '../../constants/spacing';

export default function AttentionStealers() {
  const { logStealer, topStealers } = useToolStore();
  const [input, setInput] = useState('');
  const [focused, setFocused] = useState(false);
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
      <Text style={styles.title}>What's stealing your focus?</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, focused && styles.inputFocused]}
          placeholder="Name it to tame it..."
          placeholderTextColor={Colors.inkFaint}
          value={input}
          onChangeText={setInput}
          returnKeyType="done"
          onSubmitEditing={handleLog}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <TouchableOpacity style={styles.logBtn} onPress={handleLog}>
          <Text style={styles.logBtnText}>Log</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>Awareness is the first step to control.</Text>

      {top.length > 0 && (
        <View style={styles.bars}>
          {top.map((s, i) => (
            <View key={s.label} style={styles.barRow}>
              <Text style={styles.barRank}>#{i + 1}</Text>
              <Text style={styles.barLabel} numberOfLines={1}>{s.label}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${(s.count / maxCount) * 100}%` }]} />
              </View>
              <Text style={styles.barCount}>{s.count}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.goldLight,
    borderRadius: Radius.card,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.display,
    fontStyle: 'italic',
    color: Colors.gold,
  },
  inputRow: { flexDirection: 'row', gap: Spacing.sm },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1.5,
    borderColor: Colors.goldBorder,
    borderRadius: Radius.input,
    paddingHorizontal: Spacing.md,
    fontSize: FontSizes.base,
    color: Colors.ink,
    backgroundColor: Colors.white,
  },
  inputFocused: { borderColor: Colors.gold },
  logBtn: {
    backgroundColor: Colors.gold,
    borderRadius: Radius.input,
    paddingHorizontal: Spacing.md,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logBtnText: { color: Colors.white, fontFamily: Fonts.bodyBold, fontSize: FontSizes.sm },
  hint: { fontSize: FontSizes.xs, color: Colors.inkFaint, fontStyle: 'italic' },
  bars: { gap: 6, marginTop: 4 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  barRank: { width: 20, fontSize: FontSizes.xs, fontFamily: Fonts.mono, color: Colors.gold },
  barLabel: { width: 90, fontSize: FontSizes.xs, fontFamily: Fonts.body, color: Colors.inkMuted },
  barTrack: { flex: 1, height: 6, backgroundColor: Colors.goldBorder, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 6, backgroundColor: Colors.gold, borderRadius: 3 },
  barCount: { fontSize: FontSizes.xs, fontFamily: Fonts.mono, color: Colors.inkMuted, width: 18, textAlign: 'right' },
});
