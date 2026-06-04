import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import { FontSizes } from '../../constants/typography';
import { Radius } from '../../constants/spacing';

interface Props {
  label: string;
  checked: boolean;
  onToggle: () => void;
}

export default function ChecklistItem({ label, checked, onToggle }: Props) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  };

  return (
    <TouchableOpacity style={styles.row} onPress={handlePress} activeOpacity={0.7}>
      <MotiView
        animate={{ scale: checked ? 1 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={[styles.checkbox, checked && styles.checkboxChecked]}
      >
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </MotiView>
      <Text style={[styles.label, checked && styles.labelChecked]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 8 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.mutedTeal,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxChecked: { backgroundColor: Colors.primaryBlue, borderColor: Colors.primaryBlue },
  checkmark: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  label: { flex: 1, fontSize: FontSizes.base, color: Colors.darkNavy, lineHeight: 24 },
  labelChecked: { textDecorationLine: 'line-through', color: Colors.mutedTeal, opacity: 0.7 },
});
