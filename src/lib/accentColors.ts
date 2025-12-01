export type AccentColorPalette = {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
}

export type AccentColorOption = {
  id: string
  label: string
  translationKey?: string
  palette: AccentColorPalette
  ring: string
}

const accentColorOptions = [
  {
    id: 'amber',
    label: 'Amber',
    translationKey: 'accentAmber',
    palette: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
    },
    ring: 'rgba(245, 158, 11, 0.4)',
  },
  {
    id: 'bubblegum',
    label: 'Bubble Gum',
    translationKey: 'accentBubbleGum',
    palette: {
      50: '#fff0f6',
      100: '#ffe0ef',
      200: '#ffc2df',
      300: '#ff9fc9',
      400: '#ff72b5',
      500: '#ff4fa3',
      600: '#db2f83',
      700: '#b01f66',
    },
    ring: 'rgba(255, 79, 163, 0.4)',
  },
  {
    id: 'coffee',
    label: 'Coffee',
    translationKey: 'accentCoffee',
    palette: {
      50: '#f8f5f1',
      100: '#ede5dd',
      200: '#d8cfc2',
      300: '#c1b29e',
      400: '#a4866a',
      500: '#8a6b52',
      600: '#704f38',
      700: '#563d2b',
    },
    ring: 'rgba(138, 107, 82, 0.35)',
  },
  {
    id: 'emerald',
    label: 'Emerald',
    translationKey: 'accentEmerald',
    palette: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
    },
    ring: 'rgba(16, 185, 129, 0.35)',
  },
  {
    id: 'gold',
    label: 'Gold',
    translationKey: 'accentGold',
    palette: {
      50: '#fffbea',
      100: '#fff1c1',
      200: '#ffe199',
      300: '#ffd166',
      400: '#f4b400',
      500: '#e5a100',
      600: '#c48c00',
      700: '#8f6500',
    },
    ring: 'rgba(229, 161, 0, 0.35)',
  },
  {
    id: 'indigo',
    label: 'Indigo',
    translationKey: 'accentIndigo',
    palette: {
      50: '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1',
      600: '#4f46e5',
      700: '#4338ca',
    },
    ring: 'rgba(99, 102, 241, 0.45)',
  },
  {
    id: 'lime',
    label: 'Lime',
    translationKey: 'accentLime',
    palette: {
      50: '#f7fee7',
      100: '#ecfccb',
      200: '#d9f99d',
      300: '#bef264',
      400: '#a3e635',
      500: '#84cc16',
      600: '#65a30d',
      700: '#4d7c0f',
    },
    ring: 'rgba(132, 204, 22, 0.35)',
  },
  {
    id: 'rose',
    label: 'Rose',
    translationKey: 'accentRose',
    palette: {
      50: '#fff1f2',
      100: '#ffe4e6',
      200: '#fecdd3',
      300: '#fda4af',
      400: '#fb7185',
      500: '#f43f5e',
      600: '#e11d48',
      700: '#be123c',
    },
    ring: 'rgba(244, 63, 94, 0.4)',
  },
  {
    id: 'sky',
    label: 'Sky',
    translationKey: 'accentSky',
    palette: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
    },
    ring: 'rgba(14, 165, 233, 0.4)',
  },
] as const satisfies ReadonlyArray<AccentColorOption>

export type AccentColorId = (typeof accentColorOptions)[number]['id']

export const ACCENT_COLOR_OPTIONS = accentColorOptions

export const ACCENT_COLOR_MAP: Record<AccentColorId, AccentColorOption> =
  accentColorOptions.reduce(
    (acc, option) => {
      acc[option.id as AccentColorId] = option
      return acc
    },
    {} as Record<AccentColorId, AccentColorOption>,
  )

export const DEFAULT_ACCENT_COLOR_ID: AccentColorId = 'sky'
