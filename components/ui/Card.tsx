import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { Radius, Shadows } from '../../constants/spacing';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'white' | 'light' | 'dark';
}

export default function Card({ children, style, variant = 'white' }: Props) {
  const bg = variant === 'white' ? Colors.white : variant === 'light' ? Colors.lightBlue : Colors.darkNavy;
  return (
    <View style={[styles.card, { backgroundColor: bg }, Shadows.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.card,
    padding: 20,
  },
});
