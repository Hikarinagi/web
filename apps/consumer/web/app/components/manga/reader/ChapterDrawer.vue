<script setup lang="ts">
  import { cn } from '~/utils/cn'
  import type { MangaReadPageData } from '~~/server/api/pages/mangas/reader/[id]/[chapterId].get'
  import { getMangaEpisodeLabel } from '~/utils/media/manga'

  defineOptions({ name: 'MangaReaderChapterDrawer' })

  type ChapterItem = MangaReadPageData['chapters'][number]

  const props = defineProps<{
    chapters: MangaReadPageData['chapters']
    currentChapterId: number
  }>()

  const visible = defineModel<boolean>('visible', { default: false })

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
  <Drawer
    v-model:visible="visible"
    position="right"
    :pt="{
      root: {
        class: '!w-[21rem] !max-w-full !border-l !border-white/10 !bg-[#0b0e13] !text-white',
      },
      header: { class: '!px-5' },
      content: { class: '!px-3 !pb-3' },
      pcCloseButton: { root: { class: '!text-[#b8c2d1]' } },
    }"
  >
    <template #header>
      <div class="flex items-baseline gap-2">
        <h3 class="text-sm font-semibold text-white">章节目录</h3>
        <span class="text-xs text-[#8b95a6]">{{ items.length }} 话</span>
      </div>
    </template>
    <div class="flex flex-col gap-0.5">
      <Button
        v-for="chapter in items"
        :key="chapter.id"
        unstyled
        :class="
          cn(
            'flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
            chapter.id === currentChapterId
              ? 'bg-primary/12 text-primary'
              : chapter.readable
                ? 'cursor-pointer text-white hover:bg-white/8'
                : 'cursor-default text-white opacity-40',
          )
        "
        :disabled="!chapter.readable"
        @click="select(chapter)"
      >
        <span class="flex min-w-0 items-baseline gap-2">
          <span class="shrink-0 text-[13px] font-medium">{{ getMangaEpisodeLabel(chapter) }}</span>
          <span class="truncate text-xs text-[#8b95a6]">{{ chapterTitle(chapter) }}</span>
        </span>
        <span v-if="chapter.readable" class="shrink-0 text-[11px] text-[#8b95a6] tabular-nums">
          {{ chapter.page_count }} 页
        </span>
        <span v-else class="shrink-0 text-[11px] text-[#8b95a6]">暂无资源</span>
      </Button>
    </div>
  </Drawer>
</template>
