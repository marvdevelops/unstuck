export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const;

export const Radius = {
  card: 24,
  button: 16,
  tag: 100,
  modal: 32,
  input: 20,
  small: 12,
} as const;

export const Shadows = {
  card: {
    shadowColor: '#152a3d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  modal: {
    shadowColor: '#152a3d',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.20,
    shadowRadius: 48,
    elevation: 16,
  },
  cta: {
    shadowColor: '#28a3d0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;
