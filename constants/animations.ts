import { Easing } from 'react-native-reanimated';

export const Timing = {
  enter:      { duration: 480, easing: Easing.out(Easing.cubic) },
  enterSlow:  { duration: 700, easing: Easing.out(Easing.cubic) },
  enterFast:  { duration: 280, easing: Easing.out(Easing.quad) },
  press:      { duration: 120, easing: Easing.inOut(Easing.quad) },
  release:    { duration: 200, easing: Easing.out(Easing.quad) },
  breathe:    { duration: 4000, easing: Easing.inOut(Easing.sin) },
  breatheSlow:{ duration: 8000, easing: Easing.inOut(Easing.sin) },
  dissolve:   { duration: 2400, easing: Easing.in(Easing.quad) },

  springs: {
    default: { type: 'spring' as const, stiffness: 300, damping: 22 },
    bouncy:  { type: 'spring' as const, stiffness: 450, damping: 16 },
    gentle:  { type: 'spring' as const, stiffness: 180, damping: 20 },
    snappy:  { type: 'spring' as const, stiffness: 500, damping: 28 },
  },
} as const;

export const stagger = (index: number, base = 60) => index * base;
