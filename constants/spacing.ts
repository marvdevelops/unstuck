export const Spacing = {
  xs:    4,
  sm:    8,
  md:    16,
  lg:    24,
  xl:    32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const Radius = {
  sm:     10,
  button: 14,
  card:   20,
  hero:   28,
  modal:  28,
  input:  16,
  tag:    999,
  circle: 999,
  // legacy aliases
  small:  10,
} as const;

export const Shadows = {
  card: {
    shadowColor: '#2E6E80',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  hero: {
    shadowColor: '#1C4D5C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  cta: {
    shadowColor: '#2E6E80',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.30,
    shadowRadius: 18,
    elevation: 6,
  },
  fab: {
    shadowColor: '#2E6E80',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 18,
    elevation: 8,
  },
  modal: {
    shadowColor: '#1A2A35',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 16,
  },
} as const;
