export const Fonts = {
  // Fraunces — variable optical-size serif
  display:            'Fraunces_400Regular',
  displayLight:       'Fraunces_300Light',
  displayItalic:      'Fraunces_400Regular_Italic',
  displayLightItalic: 'Fraunces_300Light_Italic',

  // Plus Jakarta Sans — humanist sans
  body:       'PlusJakartaSans_400Regular',
  bodyMedium: 'PlusJakartaSans_500Medium',
  bodyBold:   'PlusJakartaSans_600SemiBold',

  // DM Mono — tabular
  mono: 'DMMonoRegular',
} as const;

export const FontSizes = {
  xs:    11,
  sm:    13,
  base:  15,
  lg:    18,
  xl:    22,
  '2xl': 26,
  '3xl': 30,
  '4xl': 36,
  hero:  46,
  mono:  64,
} as const;
