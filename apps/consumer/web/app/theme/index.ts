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

// 迁移期过渡：把 PrimeVue 的 surface 调色板从 Aura 的 slate(带蓝)换成 hina 的 neutral(三通道相等、
// 不掺色相)，未迁移的 surface-N 因此与已迁移的 hina 组件同色，深色下不会出现蓝黑与纯黑并排。
// 迁移完成、surface-N 归零后连同本表一起删除。
const hinaNeutralSurface = {
  0: '#ffffff',
  50: '#fafafa',
  100: '#f5f5f5',
  200: '#e5e5e5',
  300: '#d4d4d4',
  400: '#a3a3a3',
  500: '#737373',
  600: '#525252',
  700: '#404040',
  800: '#262626',
  900: '#171717',
  950: '#0a0a0a',
}

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
        surface: hinaNeutralSurface,
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
        surface: hinaNeutralSurface,
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
