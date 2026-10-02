<script setup lang="ts">
  import { Button, Center, Stack, Tag, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { VolumeCard } from '~/features/manga/volumes'

  defineOptions({ name: 'MangaChaptersVolumeCard' })

  const props = defineProps<{
    mangaId: number
    card: VolumeCard
  }>()
  const emit = defineEmits<{ contribute: [card: VolumeCard] }>()

  const readable = computed(() => props.card.whole?.readable ?? false)
  const readerPath = computed(() =>
    props.card.whole ? `/mangas/${props.mangaId}/read/${props.card.whole.id}` : null,
  )
  const to = computed(() =>
    props.card.entry ? `/manga-volumes/${props.card.entry.id}` : readerPath.value!,
  )
</script>

<template>
  <Stack as="span" gap="none" class="group relative">
    <NuxtLink :to="to" class="flex hn-interactive flex-col gap-1.5 rounded-lg hn-press-none">
      <Stack
        as="span"
        gap="none"
        class="relative aspect-7/10 overflow-hidden rounded-lg ring-1 ring-line"
      >
        <HikariImage
          :src="card.cover"
          :alt="card.title"
          class="absolute inset-0 size-full"
          image-class="object-cover"
          :processing="{ width: 360, quality: 88, fit: 'cover' }"
        >
          <template #empty><MangaCoverFallback :title="card.title" /></template>
          <template #error><MangaCoverFallback :title="card.title" /></template>
        </HikariImage>
        <Tag
          v-if="readable"
          tone="neutral"
          size="sm"
          class="absolute bottom-1.5 left-1.5 tabular-nums"
        >
          {{ card.whole!.page_count }} P
        </Tag>
      </Stack>
      <Stack gap="none">
        <Text
          size="xs"
          weight="medium"
          truncate
          class="transition-colors group-hover:text-accent-text"
        >
          {{ card.title }}
        </Text>
        <Text v-if="readable && card.year" size="xs" tone="muted" truncate>{{ card.year }}</Text>
        <Text v-else-if="!readable" size="xs" tone="faint" truncate>没有内容</Text>
      </Stack>
    </NuxtLink>
    <Center
      v-if="card.entry"
      class="pointer-events-none absolute inset-x-0 top-0 aspect-7/10 rounded-lg bg-neutral-1000/40 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
    >
      <Button
        v-if="readable"
        :as="NuxtLink"
        :to="readerPath!"
        size="sm"
        tone="neutral"
        class="pointer-events-auto"
      >
        阅读整卷
      </Button>
      <Button
        v-else
        size="sm"
        tone="neutral"
        class="pointer-events-auto"
        @click="emit('contribute', card)"
      >
        投稿本卷
      </Button>
    </Center>
  </Stack>
</template>
