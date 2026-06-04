import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../../constants/colors';
import { FontSizes } from '../../../constants/typography';
import { Spacing, Radius } from '../../../constants/spacing';

type BinType = 'unsorted' | 'deep' | 'admin';

interface Task {
  id: string;
  label: string;
  bin: BinType;
}

export default function BatchingScreen() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState('');

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setTasks((prev) => [...prev, { id: Date.now().toString(), label: trimmed, bin: 'unsorted' }]);
    setInput('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const moveTo = (id: string, bin: BinType) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, bin } : t)));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const BINS: { key: BinType; label: string; color: string; bg: string }[] = [
    { key: 'unsorted', label: 'Unsorted', color: Colors.mutedTeal, bg: '#f1f5f9' },
    { key: 'deep', label: 'Deep Work', color: Colors.primaryBlue, bg: Colors.lightBlue },
    { key: 'admin', label: 'Life Admin', color: Colors.amber, bg: '#fef3c7' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
      <Text style={styles.title}>Context Bins</Text>

      <View style={styles.explainer}>
        <Text style={styles.explainerText}>
          Protect your cognitive energy. Task-switching drains your brain. Do all your admin when your brain is tired, and protect your peak energy hours for your deep work.
        </Text>
      </View>

      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a task and press Add"
          placeholderTextColor={Colors.mutedTeal}
          value={input}
          onChangeText={setInput}
          returnKeyType="done"
          onSubmitEditing={handleAdd}
        />
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {BINS.map((bin) => {
        const binTasks = tasks.filter((t) => t.bin === bin.key);
        return (
          <View key={bin.key} style={[styles.bin, { backgroundColor: bin.bg }]}>
            <Text style={[styles.binLabel, { color: bin.color }]}>{bin.label}</Text>
            {binTasks.length === 0 && <Text style={styles.emptyBin}>Drop tasks here</Text>}
            {binTasks.map((task) => (
              <View key={task.id} style={styles.taskCard}>
                <Text style={styles.taskLabel} numberOfLines={2}>{task.label}</Text>
                <View style={styles.moveBtns}>
                  {BINS.filter((b) => b.key !== bin.key).map((b) => (
                    <TouchableOpacity key={b.key} style={[styles.moveBtn, { borderColor: b.color }]} onPress={() => moveTo(task.id, b.key)}>
                      <Text style={[styles.moveBtnText, { color: b.color }]}>{b.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>
        );
      })}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  content: { padding: Spacing.lg, paddingTop: 60, gap: Spacing.md },
  backBtn: { marginBottom: Spacing.sm },
  backText: { color: Colors.primaryBlue, fontSize: FontSizes.base, fontWeight: '500' },
  title: { fontSize: FontSizes['2xl'], fontWeight: '700', color: Colors.darkNavy },
  explainer: {
    backgroundColor: Colors.lightBlue,
    borderRadius: Radius.button,
    padding: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primaryBlue,
  },
  explainerText: { fontSize: FontSizes.sm, color: Colors.mutedTeal, lineHeight: 22 },
  addRow: { flexDirection: 'row', gap: Spacing.sm },
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
  addBtn: {
    backgroundColor: Colors.primaryBlue,
    borderRadius: Radius.button,
    height: 44,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: Colors.white, fontWeight: '600' },
  bin: { borderRadius: Radius.card, padding: Spacing.md, gap: Spacing.sm },
  binLabel: { fontSize: FontSizes.sm, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  emptyBin: { fontSize: FontSizes.sm, color: Colors.mutedTeal, fontStyle: 'italic', textAlign: 'center', padding: Spacing.sm },
  taskCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.small,
    padding: Spacing.sm,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  taskLabel: { fontSize: FontSizes.base, color: Colors.darkNavy },
  moveBtns: { flexDirection: 'row', gap: 8 },
  moveBtn: { borderWidth: 1.5, borderRadius: Radius.tag, paddingHorizontal: 10, paddingVertical: 4 },
  moveBtnText: { fontSize: FontSizes.xs, fontWeight: '600' },
});
