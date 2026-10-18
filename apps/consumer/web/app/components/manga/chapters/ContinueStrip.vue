<script setup lang="ts">
  import { Button, Inline, Stack, Text } from '@hina-ui/vue'
  import type { MangaPageData } from '~~/server/api/pages/mangas/[id].get'
  import { getMangaEpisodeLabel } from '~/utils/media/manga'

  defineOptions({ name: 'MangaChaptersContinueStrip' })

  const props = defineProps<{
    mangaId: number
    progress: NonNullable<MangaPageData['progress']>
    first: MangaPageData['chapters'][number] | null
  }>()

  const title = computed(() => {
    const chapter = props.progress.chapter
    const label = getMangaEpisodeLabel(chapter)
    const name = chapter.chapter_number ? chapter.name_cn || chapter.name : null
    return name ? `${label} · ${name}` : label
  })

  function read(chapterId: number) {
    void navigateTo(`/mangas/${props.mangaId}/read/${chapterId}`)
  }
</script>

<template>
  <Inline gap="none" class="gap-x-3.5 gap-y-2 rounded-lg bg-subtle py-1.5 pr-3.5 pl-3">
    <HikariImage
      v-if="progress.thumbnail"
      :src="progress.thumbnail"
      :alt="title"
      class="h-14.5 w-12.5 shrink-0 overflow-hidden rounded"
      image-class="size-full object-cover"
    />
    <Stack gap="none" class="min-w-0 flex-1 gap-0.5">
      <Text size="xs" tone="muted">上次读到</Text>
      <Inline gap="none" :wrap="false" class="min-w-0 gap-2">
        <Text as="span" size="sm" weight="medium" truncate class="min-w-0">{{ title }}</Text>
        <Text v-if="progress.chapter.page_count" as="span" size="xs" tone="muted" class="shrink-0">
          第 {{ progress.page }} / {{ progress.chapter.page_count }} 页
        </Text>
      </Inline>
    </Stack>
    <Inline gap="none" :wrap="false" class="gap-1.5">
      <Button size="sm" @click="read(progress.chapter.id)">继续阅读</Button>
      <Button v-if="first" variant="ghost" tone="neutral" size="sm" @click="read(first.id)">
        从头开始
      </Button>
    </Inline>
  </Inline>
</template>
