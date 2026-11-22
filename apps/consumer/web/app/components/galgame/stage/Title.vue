<script setup lang="ts">
  import { Heading, Link, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'
  import { logoClass, stageLogo } from '~/features/galgame/logo'
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
  const shown = computed(() => stageLogo(props.data.galgame.logos, props.data.galgame.origin_lang))
  const logo = computed(() => shown.value.logo)
  const chinese = computed(() => logo.value?.language === 'zh-Hans')
  const brandClass = computed(() =>
    cn(
      shown.value.light && 'hidden',
      shown.value.dark ? 'dark:hidden' : shown.value.light && 'dark:block',
    ),
  )

  const logoTone = computed(() => (logo.value ? logoClass(logo.value) : ''))
  const headingClass = computed(() => {
    const beside = chinese.value === translated.value ? 'hidden' : 'small'
    const light = { plain: 'text-4xl lg:text-6xl', small: 'text-xl lg:text-3xl', hidden: 'sr-only' }
    const dark = {
      plain: 'dark:not-sr-only dark:text-4xl dark:lg:text-6xl',
      small: 'dark:not-sr-only dark:text-xl dark:lg:text-3xl',
      hidden: 'dark:sr-only',
    }
    return cn(
      light[shown.value.light ? beside : 'plain'],
      dark[shown.value.dark ? beside : 'plain'],
    )
  })
  const subtitleClass = computed(() => {
    const repeated = !chinese.value && translated.value
    return cn(
      shown.value.light && repeated && 'sr-only',
      shown.value.dark && repeated ? 'dark:sr-only' : 'dark:not-sr-only',
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
      :class="cn('self-start text-sm font-medium text-fg/80 lg:text-base', brandClass)"
      lang="ja"
    >
      {{ brand.text }}
    </Link>
    <Text
      v-else-if="brand"
      size="sm"
      weight="medium"
      :class="cn('text-fg/80', brandClass)"
      lang="ja"
    >
      {{ brand.text }}
    </Text>
    <HikariImage
      v-if="logo"
      :src="logo.media"
      alt=""
      fit="contain"
      :processing="logoProcessing"
      :skeleton="false"
      :thumbhash="false"
      :ratio="logoBox?.ratio"
      :style="logoBox?.style"
      :class="
        cn(
          'my-1 max-w-full',
          logoBox
            ? 'w-[min(var(--logo-w),100%,var(--stage-logo-width),calc(var(--logo-ratio)*var(--stage-logo-height)))]'
            : 'w-fit',
          logoTone,
        )
      "
      :image-class="
        logoBox
          ? 'size-full object-contain object-left'
          : 'h-auto max-h-(--stage-logo-height) w-auto max-w-[min(100%,var(--stage-logo-width))] object-left'
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
