<script setup lang="ts">
  import { Heading, Link, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'GalgameStageTitle' })
  const props = defineProps<{ data: GalgamePageData; title: string }>()

  const brand = computed(() => props.data.display.brands[0] ?? null)
  const translated = computed(
    () =>
      Boolean(props.data.display.original_title) &&
      props.data.display.original_title !== props.title,
  )
  const subtitle = computed(() => {
    const { display, galgame } = props.data
    if (translated.value && display.original_title)
      return { text: display.original_title, lang: 'ja' }
    return galgame.en_title ? { text: galgame.en_title, lang: 'en' } : null
  })
  const logo = computed(() => {
    const { logos, origin_lang } = props.data.galgame
    const shown = logos.filter(item => item.light !== 'HIDDEN' || item.dark !== 'HIDDEN')
    return (
      shown.find(item => item.language === 'zh-Hans') ??
      shown.find(item => (item.language ?? origin_lang) === origin_lang) ??
      null
    )
  })
  const shownOn = computed(() => ({
    light: Boolean(logo.value && logo.value.light !== 'HIDDEN'),
    dark: Boolean(logo.value && logo.value.dark !== 'HIDDEN'),
  }))
  const chinese = computed(() => logo.value?.language === 'zh-Hans')

  const logoClass = computed(() => {
    if (!logo.value) return ''
    const light = {
      ORIGINAL: 'block',
      INVERTED: 'block invert hue-rotate-180',
      HIDDEN: 'hidden',
    }[logo.value.light]
    const dark = {
      ORIGINAL: 'dark:block dark:invert-0 dark:hue-rotate-0',
      INVERTED: 'dark:block dark:invert dark:hue-rotate-180',
      HIDDEN: 'dark:hidden',
    }[logo.value.dark]
    return cn(light, dark)
  })
  const headingClass = computed(() => {
    const beside = chinese.value === translated.value ? 'hidden' : 'small'
    const light = { plain: 'text-4xl lg:text-6xl', small: 'text-xl lg:text-3xl', hidden: 'sr-only' }
    const dark = {
      plain: 'dark:not-sr-only dark:text-4xl dark:lg:text-6xl',
      small: 'dark:not-sr-only dark:text-xl dark:lg:text-3xl',
      hidden: 'dark:sr-only',
    }
    return cn(
      light[shownOn.value.light ? beside : 'plain'],
      dark[shownOn.value.dark ? beside : 'plain'],
    )
  })
  const subtitleClass = computed(() => {
    const repeated = !chinese.value && translated.value
    return cn(
      shownOn.value.light && repeated && 'sr-only',
      shownOn.value.dark && repeated ? 'dark:sr-only' : 'dark:not-sr-only',
    )
  })
  const logoBox = computed(() => {
    const { width, height } = logo.value?.media ?? {}
    return width && height
      ? {
          ratio: width / height,
          style: { '--logo-w': `${width}px`, '--logo-ratio': width / height },
        }
      : null
  })
  const logoProcessing = { width: 960, quality: 90, fit: 'scale-down', format: 'auto' } as const
</script>

<template>
  <Stack gap="xs">
    <Link
      v-if="brand?.producer_id"
      :as="NuxtLink"
      :to="`/producers/${brand.producer_id}`"
      tone="neutral"
      class="self-start text-sm font-medium text-fg/80 lg:text-base"
      lang="ja"
    >
      {{ brand.text }}
    </Link>
    <Text v-else-if="brand" size="sm" weight="medium" class="text-fg/80" lang="ja">
      {{ brand.text }}
    </Text>
    <HikariImage
      v-if="logo"
      :src="logo.media"
      alt=""
      fit="contain"
      :processing="logoProcessing"
      :lazy="false"
      :skeleton="false"
      :thumbhash="false"
      :ratio="logoBox?.ratio"
      :style="logoBox?.style"
      :class="
        cn(
          'my-1 max-w-full',
          logoBox
            ? 'w-[min(var(--logo-w),100%,calc(var(--logo-ratio)*var(--spacing)*20))] lg:w-[min(var(--logo-w),100%,var(--container-lg),calc(var(--logo-ratio)*var(--spacing)*32))]'
            : 'w-fit',
          logoClass,
        )
      "
      :image-class="
        logoBox
          ? 'size-full object-contain object-left'
          : 'h-auto max-h-20 w-auto max-w-full object-left lg:max-h-32 lg:max-w-lg'
      "
    />
    <Heading :level="1" :class="cn('leading-tight font-bold tracking-tight text-fg', headingClass)">
      {{ title }}
    </Heading>
    <Text
      v-if="subtitle"
      tone="muted"
      :class="cn('text-base lg:text-xl', subtitleClass)"
      :lang="subtitle.lang"
    >
      {{ subtitle.text }}
    </Text>
  </Stack>
</template>
