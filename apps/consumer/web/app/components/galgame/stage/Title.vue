<script setup lang="ts">
  import { Heading, Link, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'

  defineOptions({ name: 'GalgameStageTitle' })
  const props = defineProps<{ data: GalgamePageData; title: string }>()

  const brand = computed(() => props.data.display.brands[0] ?? null)
  const subtitle = computed(() => {
    const { display, galgame } = props.data
    if (display.original_title && display.original_title !== props.title)
      return { text: display.original_title, lang: 'ja' }
    return galgame.en_title ? { text: galgame.en_title, lang: 'en' } : null
  })
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
    <Heading :level="1" class="text-4xl leading-tight font-bold tracking-tight text-fg lg:text-6xl">
      {{ title }}
    </Heading>
    <Text v-if="subtitle" tone="muted" class="text-base lg:text-xl" :lang="subtitle.lang">
      {{ subtitle.text }}
    </Text>
  </Stack>
</template>
