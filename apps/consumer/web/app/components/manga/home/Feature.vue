<script setup lang="ts">
  import { Button, Heading, Inline, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { MangaStreamBatch } from '~~/server/api/pages/mangas.get'
  import { statusText, titleOf } from '~/features/manga/explore'
  import { topVotedMedia } from '~/utils/media/image'

  defineOptions({ name: 'MangaHomeFeature' })
  const props = defineProps<{
    item: Extract<MangaStreamBatch['modules'][number], { kind: 'feature' }>['item']
    intro: string | null
  }>()

  const backdropProcessing = {
    width: 1200,
    height: 260,
    fit: 'cover',
    quality: 60,
    blur: 40,
  } as const

  const factText = computed(() => {
    const year = props.item.publication_date
      ? new Date(props.item.publication_date).getUTCFullYear()
      : Number.NaN
    return [Number.isFinite(year) ? `${year} 年开始连载` : '', statusText(props.item.serial_status)]
      .filter(Boolean)
      .join(' · ')
  })
</script>

<template>
  <Stack
    gap="none"
    as="section"
    class="relative isolate overflow-hidden rounded-2xl border border-line"
  >
    <Stack gap="none" class="absolute inset-0 -z-20">
      <HikariImage
        :src="topVotedMedia(item.covers)"
        alt=""
        class="size-full"
        image-class="object-cover"
        :processing="backdropProcessing"
        :skeleton="false"
      >
        <template #empty />
        <template #error />
      </HikariImage>
    </Stack>
    <Stack
      gap="none"
      aria-hidden="true"
      class="absolute inset-0 -z-10 bg-linear-to-r from-canvas/95 via-canvas/85 to-canvas/40"
    />
    <Inline gap="lg" align="center" :wrap="false" class="p-6">
      <NuxtLink :to="`/mangas/${item.id}`" class="block w-30 shrink-0">
        <HikariImage
          :src="topVotedMedia(item.covers)"
          :alt="titleOf(item)"
          class="aspect-2/3 w-full overflow-hidden rounded-lg shadow-lg"
          image-class="size-full object-cover object-top"
          preset="medium"
        />
      </NuxtLink>
      <Stack gap="sm" align="start" class="min-w-0">
        <Text as="p" size="xs" weight="semibold" class="tracking-widest text-accent-text uppercase">
          完结经典
        </Text>
        <Heading :level="3" size="xl" truncate>{{ titleOf(item) }}</Heading>
        <Text as="p" size="sm" tone="muted" class="h-5">{{ factText }}</Text>
        <Text v-if="intro" as="p" size="sm" tone="muted" class="line-clamp-2 max-w-120">
          {{ intro }}
        </Text>
        <Button :as="NuxtLink" :to="`/mangas/${item.id}`" size="sm" class="mt-1">查看详情</Button>
      </Stack>
    </Inline>
  </Stack>
</template>
