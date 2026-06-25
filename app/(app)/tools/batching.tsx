import { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { Layers, Zap, Coffee, Inbox, ChevronLeft } from '../../../lib/icons';
import { Colors } from '../../../constants/colors';
import { Fonts, FontSizes } from '../../../constants/typography';
import { Spacing, Radius } from '../../../constants/spacing';

type BinType = 'unsorted' | 'deep' | 'admin';

interface Task {
  id: string;
  label: string;
  bin: BinType;
}

const BINS: {
  key: BinType;
  label: string;
  sublabel: string;
  color: string;
  bg: string;
  headerBg: string;
  Icon: React.ComponentType<any>;
}[] = [
  {
    key: 'deep',
    label: 'Deep Work',
    sublabel: 'Protected Zone — peak energy only',
    color: Colors.primaryBlue,
    bg: Colors.lightBlue,
    headerBg: Colors.primaryBlue,
    Icon: Zap,
  },
  {
    key: 'admin',
    label: 'Life Admin',
    sublabel: 'Brain-Off Tasks — batch when tired',
    color: Colors.goldText,
    bg: Colors.goldLight,
    headerBg: Colors.gold,
    Icon: Coffee,
  },
  {
    key: 'unsorted',
    label: 'Drop Zone',
    sublabel: 'Sort these into the right bin',
    color: Colors.inkMuted,
    bg: Colors.sandDeep,
    headerBg: Colors.inkMuted,
    Icon: Inbox,
  },
];

const BIN_ORDER: BinType[] = ['deep', 'admin', 'unsorted'];

export default function BatchingScreen() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setTasks((prev) => [
      ...prev,
      { id: Date.now().toString(), label: trimmed, bin: 'unsorted' },
    ]);
    setInput('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Keep keyboard open for rapid entry
    inputRef.current?.focus();
  };

  const moveTo = (id: string, bin: BinType) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, bin } : t)));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const getOtherBins = (current: BinType) =>
    BINS.filter((b) => b.key !== current);

  return (
    <View style={styles.outer}>
      <KeyboardAwareScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={24}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={18} color={Colors.tideMid} strokeWidth={2} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.titleRow}>
          <Layers size={22} color={Colors.tide} strokeWidth={2} />
          <Text style={styles.title}>Context Bins</Text>
        </View>

        <View style={styles.explainer}>
          <Text style={styles.explainerText}>
            Protect your peak energy for deep work. Batch your admin for when your brain is tired.
          </Text>
        </View>

        {/* Swim lanes */}
        {BINS.map((bin) => {
          const binTasks = tasks.filter((t) => t.bin === bin.key);
          return (
            <View key={bin.key} style={styles.lane}>
              {/* Lane header */}
              {bin.key === 'unsorted' ? (
                <View style={[styles.laneHeader, { backgroundColor: Colors.inkMuted }]}>
                  <View style={styles.laneHeaderLeft}>
                    <bin.Icon size={16} color={Colors.white} strokeWidth={2.2} />
                    <Text style={styles.laneTitle}>{bin.label}</Text>
                  </View>
                  <View style={styles.laneBadge}>
                    <Text style={styles.laneBadgeText}>{binTasks.length}</Text>
                  </View>
                </View>
              ) : (
                <LinearGradient
                  colors={bin.key === 'deep' ? Colors.gradients.cta : Colors.gradients.ctaGold}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.laneHeader}
                >
                  <View style={styles.laneHeaderLeft}>
                    <bin.Icon size={16} color={Colors.white} strokeWidth={2.2} />
                    <Text style={styles.laneTitle}>{bin.label}</Text>
                  </View>
                  <View style={styles.laneBadge}>
                    <Text style={styles.laneBadgeText}>{binTasks.length}</Text>
                  </View>
                </LinearGradient>
              )}

              <View style={[styles.laneBody, { backgroundColor: bin.bg }]}>
                <Text style={[styles.laneSublabel, { color: bin.color }]}>{bin.sublabel}</Text>

                {binTasks.length === 0 && (
                  <Text style={styles.emptyHint}>Drop tasks here</Text>
                )}

                {binTasks.map((task, i) => (
                  <MotiView
                    key={task.id}
                    from={{ opacity: 0, translateX: -12 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ type: 'spring', damping: 20, delay: i * 40 }}
                    style={[styles.taskCard, { borderLeftColor: bin.color }]}
                  >
                    <Text style={styles.taskLabel} numberOfLines={2}>{task.label}</Text>
                    <View style={styles.taskActions}>
                      {getOtherBins(bin.key).map((b) => (
                        <TouchableOpacity
                          key={b.key}
                          style={[styles.moveChip, { borderColor: b.color + '60', backgroundColor: b.bg }]}
                          onPress={() => moveTo(task.id, b.key)}
                        >
                          <b.Icon size={11} color={b.color} strokeWidth={2.2} />
                          <Text style={[styles.moveChipText, { color: b.color }]}>{b.label}</Text>
                        </TouchableOpacity>
                      ))}
                      <TouchableOpacity style={styles.deleteChip} onPress={() => removeTask(task.id)}>
                        <Text style={styles.deleteChipText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  </MotiView>
                ))}
              </View>
            </View>
          );
        })}

        <View style={{ height: 120 }} />
      </KeyboardAwareScrollView>

      {/* Pinned input bar */}
      <View style={styles.inputBar}>
        <TextInput
          ref={inputRef}
          style={[styles.input, inputFocused && styles.inputFocused]}
          placeholder="Add a task..."
          placeholderTextColor={Colors.inkFaint}
          value={input}
          onChangeText={setInput}
          returnKeyType="done"
          onSubmitEditing={handleAdd}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          blurOnSubmit={false}
        />
        <TouchableOpacity onPress={handleAdd} disabled={!input.trim()} activeOpacity={0.85}>
          <LinearGradient
            colors={input.trim() ? Colors.gradients.cta : ['#AAC0CA', '#AAC0CA']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.addBtn}
          >
            <Text style={styles.addBtnText}>Add</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: Colors.white },
  container: { flex: 1 },
  content: { padding: Spacing.lg, paddingTop: 60, gap: Spacing.md },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: Spacing.sm },
  backText: { color: Colors.tideMid, fontSize: FontSizes.sm, fontFamily: Fonts.bodyMedium },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  title: { fontSize: FontSizes['2xl'], fontFamily: Fonts.display, color: Colors.ink },
  explainer: {
    backgroundColor: Colors.tideLight, borderRadius: Radius.button,
    padding: Spacing.md, borderLeftWidth: 3, borderLeftColor: Colors.tide,
    marginBottom: Spacing.sm,
  },
  explainerText: { fontSize: FontSizes.sm, color: Colors.inkSoft, lineHeight: 22 },
  lane: {
    borderRadius: Radius.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  laneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },
  laneHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  laneTitle: { fontSize: FontSizes.sm, fontFamily: Fonts.bodyBold, color: Colors.white, letterSpacing: 0.5 },
  laneBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 999,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  laneBadgeText: { fontSize: 11, color: Colors.white, fontWeight: '700' },
  laneBody: { padding: Spacing.md, gap: Spacing.sm },
  laneSublabel: { fontSize: FontSizes.xs, fontWeight: '600', letterSpacing: 0.3, marginBottom: 4 },
  emptyHint: {
    fontSize: FontSizes.sm, color: Colors.mutedTeal,
    fontStyle: 'italic', textAlign: 'center', paddingVertical: Spacing.sm,
  },
  taskCard: {
    backgroundColor: Colors.white, borderRadius: Radius.small,
    padding: Spacing.sm, gap: 8,
    borderWidth: 1, borderColor: '#e2e8f0',
    borderLeftWidth: 3,
  },
  taskLabel: { fontSize: FontSizes.base, color: Colors.ink, lineHeight: 22 },
  taskActions: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  moveChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderRadius: Radius.tag,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  moveChipText: { fontSize: 11, fontWeight: '600' },
  deleteChip: {
    borderWidth: 1, borderColor: '#e2e8f0', borderRadius: Radius.tag,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  deleteChipText: { fontSize: 11, color: Colors.mutedTeal },
  inputBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 32 : Spacing.md,
    backgroundColor: Colors.sandDeep,
    borderTopWidth: 1,
    borderTopColor: Colors.sandBorder,
  },
  input: {
    flex: 1, height: 48,
    borderWidth: 1.5, borderColor: Colors.sandBorder,
    borderRadius: Radius.button, paddingHorizontal: Spacing.md,
    fontSize: FontSizes.base, fontFamily: Fonts.body,
    color: Colors.ink, backgroundColor: Colors.white,
  },
  inputFocused: { borderColor: Colors.tide },
  addBtn: {
    borderRadius: Radius.button,
    height: 48, paddingHorizontal: Spacing.lg, alignItems: 'center', justifyContent: 'center',
  },
  addBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSizes.base },
});
