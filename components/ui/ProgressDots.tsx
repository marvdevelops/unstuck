import { View, StyleSheet, ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import { Colors } from '../../constants/colors';

interface Props {
  total: number;
  current: number;
  style?: ViewStyle;
}

export default function ProgressDots({ total, current, style }: Props) {
  return (
    <View style={[styles.row, style]}>
      {Array.from({ length: total }).map((_, i) => {
        const isActive = i < current;
        return (
          <MotiView
            key={i}
            animate={{ width: isActive ? 20 : 6 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            style={[
              styles.dot,
              isActive ? styles.dotActive : styles.dotInactive,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, justifyContent: 'center', alignItems: 'center' },
  dot: { height: 6, borderRadius: 3 },
  dotActive:   { backgroundColor: Colors.tide },
  dotInactive: { backgroundColor: Colors.darkBorder },
});
