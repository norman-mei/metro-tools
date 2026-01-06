import typographyPlugin from '@tailwindcss/typography'
import containerQueriesPlugin from '@tailwindcss/container-queries'
import { type Config } from 'tailwindcss'

import typographyStyles from './typography'

export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    '!./src/app/(game)/bayarea/**/*',
    '!./src/app/(game)/la/**/*',
    '!./src/app/(game)/sd/**/*',
  ],
  darkMode: 'class',
  plugins: [typographyPlugin, containerQueriesPlugin],
  theme: {
    fontSize: {
      xs: ['0.8125rem', { lineHeight: '1.5rem' }],
      sm: ['0.875rem', { lineHeight: '1.5rem' }],
      base: ['1rem', { lineHeight: '1.75rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '2rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '3.5rem' }],
      '6xl': ['3.75rem', { lineHeight: '1' }],
      '7xl': ['4.5rem', { lineHeight: '1' }],
      '8xl': ['6rem', { lineHeight: '1' }],
      '9xl': ['8rem', { lineHeight: '1' }],
    },
    typography: typographyStyles,
    extend: {
      animation: {
        shake: 'shake 0.5s ease-in-out',
        marquee: 'marquee var(--marquee-duration, 12s) linear infinite',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(-2px) ' },
          '10%, 90%': { transform: 'translateX(1px)' },
          '30%, 50%, 70%': { transform: 'translateX(2px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': {
            transform: 'translateX(calc(-1 * var(--marquee-distance, 100%)))',
          },
        },
      },
    },
  },
} satisfies Config
