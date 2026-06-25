import { TouchableOpacity, Text } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withSpring, withSequence,
  interpolateColor,
} from 'react-native-reanimated';
import { MotiView } from 'moti';
import { Check } from '../../lib/icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import { Fonts, FontSizes } from '../../constants/typography';
import { Radius } from '../../constants/spacing';
import { Timing } from '../../constants/animations';

interface Props {
  label: string;
  checked: boolean;
  onToggle: () => void;
  type?: 'routine' | 'spot';
}

export default function ChecklistItem({ label, checked, onToggle, type = 'routine' }: Props) {
  const fillProgress = useSharedValue(checked ? 1 : 0);
  const scale        = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.97, Timing.press),
      withSpring(1, Timing.springs.snappy),
    );
    if (!checked) {
      fillProgress.value = withSpring(1, Timing.springs.bouncy);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      fillProgress.value = withTiming(0, Timing.press);
    }
    onToggle();
  };

  const rowStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      fillProgress.value,
      [0, 1],
      ['transparent', type === 'spot' ? 'rgba(200,146,58,0.08)' : 'rgba(46,110,128,0.07)'],
    ),
    transform: [{ scale: scale.value }],
  }));

  const checkboxStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      fillProgress.value,
      [0, 1],
      ['transparent', type === 'spot' ? Colors.gold : Colors.tide],
    ),
    borderColor: interpolateColor(
      fillProgress.value,
      [0, 1],
      [Colors.sandBorder, type === 'spot' ? Colors.gold : Colors.tide],
    ),
    transform: [{ scale: 0.85 + fillProgress.value * 0.15 }],
  }));

  return (
    <Animated.View style={[styles.row, rowStyle]}>
      <TouchableOpacity onPress={handlePress} hitSlop={12}>
        <Animated.View style={[styles.checkbox, checkboxStyle]}>
          <MotiView
            animate={{ scale: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
            transition={Timing.springs.bouncy}
          >
            <Check size={12} color={Colors.white} strokeWidth={3} />
          </MotiView>
        </Animated.View>
      </TouchableOpacity>
      <Text style={[styles.label, checked && styles.labelChecked]}>{label}</Text>
    </Animated.View>
  );
}

const styles = {
  row: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: 14,
    padding: 14,
    borderRadius: Radius.button,
  },
  checkbox: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  label: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.base,
    color: Colors.ink,
    lineHeight: 24,
    flex: 1,
  },
  labelChecked: {
    textDecorationLine: 'line-through' as const,
    color: Colors.inkFaint,
    opacity: 0.6,
  },
};
