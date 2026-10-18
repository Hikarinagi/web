<script setup lang="ts">
  import { Drawer, Inline, NavLink, Stack, Text } from '@hina-ui/vue'
  import type { MangaReadPageData } from '~~/server/api/pages/mangas/reader/[id]/[chapterId].get'
  import { getMangaEpisodeLabel } from '~/utils/media/manga'

  defineOptions({ name: 'MangaReaderChapterDrawer' })

  type ChapterItem = MangaReadPageData['chapters'][number]

  const props = defineProps<{
    chapters: MangaReadPageData['chapters']
    currentChapterId: number
  }>()

  const open = defineModel<boolean>('open', { default: false })

  const emit = defineEmits<{ select: [chapter: ChapterItem] }>()

  const items = computed(() => {
    const current = props.chapters.find(chapter => chapter.id === props.currentChapterId)
    if (!current) return props.chapters
    return props.chapters.filter(chapter => chapter.chapter_type === current.chapter_type)
  })

  function chapterTitle(chapter: ChapterItem) {
    return chapter.chapter_number ? chapter.name_cn || chapter.name || '' : ''
  }

  function select(chapter: ChapterItem) {
    if (!chapter.readable || chapter.id === props.currentChapterId) return
    emit('select', chapter)
  }
</script>

<template>
  <Drawer v-model:open="open" title="章节目录" :description="`${items.length} 话`">
    <template #content>
      <Stack gap="xs">
        <NavLink
          v-for="chapter in items"
          :key="chapter.id"
          as="button"
          :active="chapter.id === currentChapterId"
          :disabled="!chapter.readable"
          class="h-auto justify-between gap-3 py-2 text-start"
          @click="select(chapter)"
        >
          <Inline gap="none" :wrap="false" align="baseline" class="min-w-0 gap-2">
            <Text as="span" size="sm" weight="medium" class="shrink-0 text-inherit">
              {{ getMangaEpisodeLabel(chapter) }}
            </Text>
            <Text as="span" size="xs" tone="muted" truncate>{{ chapterTitle(chapter) }}</Text>
          </Inline>
          <Text as="span" size="xs" tone="muted" class="shrink-0 tabular-nums">
            {{ chapter.readable ? `${chapter.page_count} 页` : '暂无资源' }}
          </Text>
        </NavLink>
      </Stack>
    </template>
  </Drawer>
</template>
