import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { Easing } from 'react-native-reanimated';

interface FluidBlobProps {
  size: number;
  colors: [string, string];
  style?: object;
  speed?: number;
  morphIntensity?: number;
  pointerEvents?: 'none' | 'auto' | 'box-none' | 'box-only';
}

export default function FluidBlob({
  size,
  colors,
  style,
  speed = 9000,
  morphIntensity = 0.28,
  pointerEvents = 'none',
}: FluidBlobProps) {
  const r = size / 2;

  return (
    <MotiView
      from={{
        borderTopLeftRadius:     r,
        borderTopRightRadius:    r * 0.72,
        borderBottomLeftRadius:  r * 0.88,
        borderBottomRightRadius: r * 0.64,
        scale: 1,
      }}
      animate={{
        borderTopLeftRadius:     r * 0.72,
        borderTopRightRadius:    r,
        borderBottomLeftRadius:  r * 0.64,
        borderBottomRightRadius: r * 0.92,
        scale: 1.05,
      }}
      transition={{
        type: 'timing',
        duration: speed,
        easing: Easing.inOut(Easing.sin),
        loop: true,
        repeatReverse: true,
      }}
      style={[{ width: size, height: size, overflow: 'hidden', position: 'absolute' }, style]}
      pointerEvents={pointerEvents}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={{ width: size, height: size }}
      />
    </MotiView>
  );
}
