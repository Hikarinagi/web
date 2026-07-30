import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'
import type { AuraBaseDesignTokens } from '@primeuix/themes/aura/base'

type PrimaryPalette = NonNullable<NonNullable<AuraBaseDesignTokens['semantic']>['primary']>

const hikariPrimaryPalette = {
  50: 'var(--color-hikari-primary-50)',
  100: 'var(--color-hikari-primary-100)',
  200: 'var(--color-hikari-primary-200)',
  300: 'var(--color-hikari-primary-300)',
  400: 'var(--color-hikari-primary-400)',
  500: 'var(--color-hikari-primary-500)',
  600: 'var(--color-hikari-primary-600)',
  700: 'var(--color-hikari-primary-700)',
  800: 'var(--color-hikari-primary-800)',
  900: 'var(--color-hikari-primary-900)',
  950: 'var(--color-hikari-primary-950)',
} satisfies PrimaryPalette

const hikarinagiTheme = definePreset(Aura, {
  primitive: {
    borderRadius: {
      md: '8px',
    },
  },
  semantic: {
    primary: hikariPrimaryPalette,
    colorScheme: {
      light: {
        primary: {
          color: '{primary.500}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.600}',
          activeColor: '{primary.700}',
        },
        highlight: {
          background: '{primary.50}',
          focusBackground: '{primary.100}',
          color: '{primary.700}',
          focusColor: '{primary.800}',
        },
      },
      dark: {
        primary: {
          color: '{primary.400}',
          contrastColor: '{surface.950}',
          hoverColor: '{primary.300}',
          activeColor: '{primary.200}',
        },
        highlight: {
          background: 'color-mix(in srgb, {primary.400}, transparent 84%)',
          focusBackground: 'color-mix(in srgb, {primary.400}, transparent 76%)',
          color: 'rgba(255, 255, 255, 0.87)',
          focusColor: 'rgba(255, 255, 255, 0.87)',
        },
      },
    },
  },
})

export default hikarinagiTheme
