import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Timer, Waves, Wind, Layers, Hand, Moon, X } from '../../../lib/icons';
import { useToolStore } from '../../../store/useToolStore';
import { Colors } from '../../../constants/colors';
import { Fonts, FontSizes } from '../../../constants/typography';
import { Spacing, Radius, Shadows } from '../../../constants/spacing';
import { Timing, stagger } from '../../../constants/animations';

// Mirrors the TOOLS array in app/(app)/index.tsx exactly — same icon, same gradient, same color
const TOOLS = [
  {
    key: 'pomodoro',
    route: '/(app)/tools/pomodoro',
    Icon: Timer,
    gradient: Colors.gradients.iconTide,
    iconColor: Colors.tideDeep,
    label: 'Focus Timer',
    sub: '25-min deep work',
  },
  {
    key: 'release',
    route: '/(app)/tools/release',
    Icon: Waves,
    gradient: Colors.gradients.iconWave,
    iconColor: '#4A5AAA',
    label: 'Release Corner',
    sub: 'Process emotions',
  },
  {
    key: 'breathing',
    route: '/(app)/tools/breathing',
    Icon: Wind,
    gradient: Colors.gradients.iconWind,
    iconColor: '#2A7A6A',
    label: '3-Min Reset',
    sub: 'Guided breathing',
  },
  {
    key: 'batching',
    route: '/(app)/tools/batching',
    Icon: Layers,
    gradient: Colors.gradients.iconGold,
    iconColor: Colors.goldText,
    label: 'Context Bins',
    sub: 'Sort your tasks',
  },
  {
    key: 'havening',
    route: '/(app)/tools/havening',
    Icon: Hand,
    gradient: Colors.gradients.iconTide,
    iconColor: Colors.tideDeep,
    label: 'Havening Touch',
    sub: 'Calm your system',
  },
  {
    key: 'zen',
    route: null,
    Icon: Moon,
    gradient: Colors.gradients.iconZen,
    iconColor: '#6A4A9A',
    label: 'Zen Mode',
    sub: 'Hide distractions',
  },
];

export default function ToolsHub() {
  const router = useRouter();
  const toggleZenMode = useToolStore((s) => s.toggleZenMode);

  return (
    <View style={styles.overlay}>
      <MotiView
        from={{ opacity: 0, translateY: 40 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={Timing.springs.gentle}
        style={styles.sheet}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Power Tools</Text>
            <Text style={styles.headerSub}>Your unstuck toolkit</Text>
          </View>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <X size={18} color={Colors.inkMuted} />
          </TouchableOpacity>
        </View>

        {/* 2-column grid — matches dashboard layout */}
        <View style={styles.grid}>
          {TOOLS.map((tool, i) => (
            <MotiView
              key={tool.key}
              from={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...Timing.springs.bouncy, delay: stagger(i, 55) }}
              style={styles.cardWrapper}
            >
              <TouchableOpacity
                style={styles.card}
                onPress={() => {
                  if (tool.key === 'zen') {
                    toggleZenMode();
                    router.back();
                  } else if (tool.route) {
                    router.push(tool.route as any);
                  }
                }}
                activeOpacity={0.82}
              >
                <LinearGradient
                  colors={tool.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconBox}
                >
                  <tool.Icon size={18} color={tool.iconColor} />
                </LinearGradient>
                <Text style={styles.cardLabel}>{tool.label}</Text>
                <Text style={styles.cardSub}>{tool.sub}</Text>
              </TouchableOpacity>
            </MotiView>
          ))}
        </View>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7,26,52,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: Spacing.lg,
    paddingBottom: 44,
    ...Shadows.modal,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  title:     { fontSize: FontSizes['2xl'], fontFamily: Fonts.displayItalic, color: Colors.ink },
  headerSub: { fontSize: FontSizes.sm, fontFamily: Fonts.body, color: Colors.inkMuted, marginTop: 2 },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Colors.sandDeep,
    alignItems: 'center', justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  cardWrapper: { width: '48%' },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.sandBorder,
    gap: 8,
    ...Shadows.card,
  },
  iconBox: {
    width: 42, height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: { fontFamily: Fonts.bodyBold, fontSize: 12, color: Colors.ink, lineHeight: 16 },
  cardSub:   { fontFamily: Fonts.body,     fontSize: FontSizes.xs, color: Colors.inkMuted },
});
