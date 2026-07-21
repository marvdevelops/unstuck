export const Colors = {
  // ── SURFACES ──────────────────────────────────────────────────────
  white:       '#FFFFFF',
  sand:        '#F7F8FA',
  sandDeep:    '#EEF2F5',
  sandBorder:  '#E2EAF0',

  // ── INK (text) ────────────────────────────────────────────────────
  ink:         '#1A2A35',
  inkSoft:     '#3A5A6A',
  inkMuted:    '#7A9AAA',
  inkFaint:    '#AAC0CA',

  // ── BRAND TIDE ────────────────────────────────────────────────────
  tide:        '#2E6E80',
  tideMid:     '#4AAFC4',
  tideLight:   '#E6F2F5',
  tideDeep:    '#1C4D5C',
  tidePale:    '#C8E8F0',

  // ── GOLD ──────────────────────────────────────────────────────────
  gold:        '#C8923A',
  goldLight:   '#FDF3E3',
  goldBorder:  '#EDD5A0',
  goldText:    '#A07020',

  // ── SEMANTIC ──────────────────────────────────────────────────────
  success:      '#3A7A56',
  successLight: '#EBF5EF',
  error:        '#B04A3A',
  errorLight:   '#F7EAE7',

  // ── DARK SCREENS ──────────────────────────────────────────────────
  darkBase:    '#071A34',
  darkAlt:     '#0D1B2E',
  darkSurface: 'rgba(255,255,255,0.07)',
  darkBorder:  'rgba(255,255,255,0.12)',
  darkText:    'rgba(255,255,255,0.85)',
  darkMuted:   'rgba(255,255,255,0.45)',
  darkFaint:   'rgba(255,255,255,0.25)',

  // ── GLASS ─────────────────────────────────────────────────────────
  glass: {
    white:       'rgba(255,255,255,0.82)',
    whiteStrong: 'rgba(255,255,255,0.94)',
    tideLight:   'rgba(46,110,128,0.10)',
    tideMid:     'rgba(46,110,128,0.18)',
    goldLight:   'rgba(200,146,58,0.10)',
    dark:        'rgba(15,27,42,0.55)',
    darkStrong:  'rgba(7,26,52,0.88)',
  },

  // ── GRADIENTS ─────────────────────────────────────────────────────
  gradients: {
    hero:       ['#2E6E80', '#4AAFC4'] as [string, string],
    heroDeep:   ['#1C4D5C', '#2E6E80'] as [string, string],
    cta:        ['#2E6E80', '#4AAFC4'] as [string, string],
    ctaGold:    ['#C8923A', '#E8B45A'] as [string, string],
    tideGlass:  ['rgba(46,110,128,0.15)', 'rgba(74,175,196,0.05)'] as [string, string],
    goldGlass:  ['rgba(200,146,58,0.14)', 'rgba(232,180,90,0.04)'] as [string, string],
    iconTide:   ['#C8EDF5', '#A0D8E8'] as [string, string],
    iconWave:   ['#C8D8F0', '#B8C0E8'] as [string, string],
    iconWind:   ['#C8F0E8', '#A0E0D0'] as [string, string],
    iconGold:   ['#FDE8C0', '#F8D090'] as [string, string],
    iconZen:    ['#D8C8E8', '#C0B0D8'] as [string, string],
    blobTide:   ['rgba(74,175,196,0.30)', 'rgba(46,110,128,0.10)'] as [string, string],
    blobGold:   ['rgba(200,146,58,0.22)', 'rgba(200,146,58,0.06)'] as [string, string],
    breatheBg:  ['#071A34', '#0D2A4A'] as [string, string],
    releaseBg:  ['#0D1B2E', '#071A34'] as [string, string],
    success:    ['#3A7A56', '#52A873'] as [string, string],
    onboardBg:  ['#0A1520', '#152535'] as [string, string],
  },

  // ── LEGACY ALIASES (tool screens use these) ───────────────────────
  primaryBlue:   '#2E6E80',
  darkNavy:      '#1A2A35',
  mutedTeal:     '#7A9AAA',
  lightBlue:     '#E6F2F5',
  amber:         '#C8923A',
  successGreen:  '#3A7A56',
  stone:         '#AAC0CA',
  primaryBlue20: 'rgba(46,110,128,0.20)',
  primaryBlue30: 'rgba(46,110,128,0.30)',
  white75:       'rgba(255,255,255,0.75)',
  white45:       'rgba(255,255,255,0.45)',
  white12:       'rgba(255,255,255,0.12)',
  white08:       'rgba(255,255,255,0.08)',
  navyOverlay08: 'rgba(26,42,53,0.08)',
  navyOverlay20: 'rgba(26,42,53,0.20)',
} as const;
