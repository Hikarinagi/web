<script setup lang="ts">
  import { AspectRatio, Stack, Tag, Text } from '@hina-ui/vue'
  import type { MangaHomePageData } from '~~/server/api/pages/mangas.get'
  import { topVotedMedia } from '~/utils/media/image'

  defineOptions({ name: 'MangaHomeCard' })
  const props = defineProps<{
    item: MangaHomePageData['updates']['items'][number]
    rank?: number
    hideStatus?: boolean
  }>()

  const title = computed(() => props.item.name_cn || props.item.name)
  const cover = computed(() => topVotedMedia(props.item.covers))
  const year = computed(() => {
    if (!props.item.publication_date) return null
    const date = new Date(props.item.publication_date)
    return Number.isNaN(date.getTime()) ? null : date.getUTCFullYear()
  })
</script>

<template>
  <NuxtLink :to="`/mangas/${item.id}`" class="group flex min-w-0 shrink-0 flex-col gap-2">
    <AspectRatio :ratio="2 / 3" class="relative overflow-hidden rounded-lg bg-subtle">
      <HikariImage
        :src="cover"
        :alt="title"
        class="size-full"
        image-class="object-cover object-top"
        preset="medium"
      >
        <template #empty />
      </HikariImage>
      <Tag
        v-if="rank"
        variant="solid"
        :tone="rank <= 3 ? 'accent' : 'neutral'"
        size="sm"
        class="absolute top-1.5 left-1.5 size-6 justify-center font-bold backdrop-blur-sm"
      >
        {{ rank }}
      </Tag>
      <Tag
        v-if="!hideStatus && item.serial_status === 'FINISHED'"
        variant="solid"
        tone="neutral"
        size="sm"
        class="absolute top-1.5 right-1.5 backdrop-blur-sm"
      >
        已完结
      </Tag>
    </AspectRatio>
    <Stack gap="none" class="min-w-0 gap-0.5">
      <Text
        size="sm"
        weight="medium"
        truncate
        class="transition-colors group-hover:text-accent-text"
      >
        {{ title }}
      </Text>
      <Text v-if="year" size="xs" tone="muted">{{ year }}</Text>
    </Stack>
  </NuxtLink>
</template>
