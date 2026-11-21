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
    return (
      logos.find(item => item.language === 'zh-Hans') ??
      logos.find(item => (item.language ?? origin_lang) === origin_lang) ??
      null
    )
  })
  const chinese = computed(() => logo.value?.language === 'zh-Hans')
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
      class="my-1 w-fit max-w-full drop-shadow-hikari-logo"
      image-class="h-auto max-h-24 w-auto max-w-full object-left lg:max-h-40 lg:max-w-xl"
    />
    <Heading
      :level="1"
      :class="
        cn(
          'leading-tight font-bold tracking-tight text-fg',
          !logo
            ? 'text-4xl lg:text-6xl'
            : chinese === translated
              ? 'sr-only'
              : 'text-xl lg:text-3xl',
        )
      "
    >
      {{ title }}
    </Heading>
    <Text
      v-if="subtitle"
      tone="muted"
      :class="cn('text-base lg:text-xl', logo && !chinese && translated && 'sr-only')"
      :lang="subtitle.lang"
    >
      {{ subtitle.text }}
    </Text>
  </Stack>
</template>
