<script setup lang="ts">
  import { Card, Center, Grid, Stack, Text } from '@hina-ui/vue'
  import { useReader } from '~/features/light-novel-reader/context'
  import {
    READER_SYSTEM_THEME,
    READER_THEMES,
    readerTheme,
  } from '~/features/light-novel-reader/themes'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'LightNovelReaderSettingsThemes' })

  const { settings } = useReader()
  const { theme } = settings

  const light = readerTheme(READER_SYSTEM_THEME, false)
  const dark = readerTheme(READER_SYSTEM_THEME, true)

  const options = [
    {
      index: READER_SYSTEM_THEME,
      label: '跟随系统',
      style: {
        backgroundImage: `linear-gradient(135deg, ${light.text} 50%, ${dark.text} 50%), linear-gradient(135deg, ${light.background} 50%, ${dark.background} 50%)`,
        backgroundOrigin: 'border-box',
        backgroundClip: 'text, border-box',
        WebkitBackgroundClip: 'text, border-box',
        color: 'transparent',
      },
    },
    ...READER_THEMES.map(item => ({
      index: item.index,
      label: item.label,
      style: { background: item.background, color: item.text },
    })),
  ]
</script>

<template>
  <Grid :cols="4" gap="sm" role="group" aria-label="主题">
    <Card
      v-for="option in options"
      :key="option.index"
      as="button"
      type="button"
      :padded="false"
      :aria-pressed="theme === option.index"
      :class="
        cn(
          'hn-state-layer hn-interactive shadow-none hn-press-lg',
          theme === option.index && 'border-accent ring-1 ring-accent',
        )
      "
      @click="settings.setTheme(option.index)"
    >
      <Stack gap="xs" align="center" class="py-2">
        <Center class="size-8 rounded-full border border-line text-sm" :style="option.style">
          文
        </Center>
        <Text as="span" size="xs">{{ option.label }}</Text>
      </Stack>
    </Card>
  </Grid>
</template>
