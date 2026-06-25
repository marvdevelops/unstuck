import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { Radius, Shadows } from '../../constants/spacing';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'white' | 'light' | 'dark' | 'sand';
}

export default function Card({ children, style, variant = 'white' }: Props) {
  const variantStyle = (() => {
    switch (variant) {
      case 'sand':  return styles.variantSand;
      case 'light': return styles.variantLight;
      case 'dark':  return styles.variantDark;
      default:      return styles.variantWhite;
    }
  })();

  return (
    <View style={[styles.card, variantStyle, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.card,
    padding: 20,
  },
  variantWhite: {
    backgroundColor: Colors.white,
    ...Shadows.card,
  },
  variantLight: {
    backgroundColor: Colors.tideLight,
    ...Shadows.card,
  },
  variantDark: {
    backgroundColor: Colors.darkBase,
  },
  variantSand: {
    backgroundColor: Colors.sandDeep,
    borderWidth: 1,
    borderColor: Colors.sandBorder,
  },
});
