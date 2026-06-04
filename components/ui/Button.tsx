import { TouchableOpacity, Text, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import { Colors } from '../../constants/colors';
import { Fonts, FontSizes } from '../../constants/typography';
import { Radius, Shadows } from '../../constants/spacing';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'amber';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export default function Button({ label, onPress, variant = 'primary', disabled, loading, style }: Props) {
  const bg = variant === 'primary' ? Colors.primaryBlue : variant === 'amber' ? Colors.amber : 'transparent';
  const border = variant === 'outline' ? Colors.primaryBlue : variant === 'amber' ? Colors.amber : 'transparent';
  const textColor = variant === 'outline' ? Colors.primaryBlue : Colors.white;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        { backgroundColor: bg, borderColor: border, borderWidth: variant === 'outline' ? 1.5 : 0 },
        variant === 'primary' && Shadows.cta,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: Radius.tag,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  label: { fontSize: FontSizes.base, fontFamily: Fonts.bodyBold },
  disabled: { opacity: 0.4 },
});
