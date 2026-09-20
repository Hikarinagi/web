<script setup lang="ts">
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

  computed(() => {
    const total = props.progress.chapter.page_count
    if (!total) return 0
    return Math.min(100, Math.max(0, Math.round((props.progress.page / total) * 100)))
  })

  function read(chapterId: number) {
    void navigateTo(`/mangas/${props.mangaId}/read/${chapterId}`)
  }
</script>

<template>
  <div class="relative overflow-hidden rounded-lg bg-emphasis">
    <div class="flex flex-wrap items-center gap-x-3.5 gap-y-2 py-1.5 pr-3.5 pl-3">
      <HikariImage
        v-if="progress.thumbnail"
        :src="progress.thumbnail"
        :alt="title"
        class="h-14.5 w-12.5 shrink-0 overflow-hidden rounded"
        image-class="size-full object-cover"
      />
      <div class="flex min-w-0 flex-1 flex-col gap-0.5">
        <p class="text-[11px] text-muted-color">上次读到</p>
        <p class="min-w-0 truncate">
          <span class="text-sm font-medium text-color">{{ title }}</span>
          <span v-if="progress.chapter.page_count" class="ml-2 text-xs text-muted-color">
            第 {{ progress.page }} / {{ progress.chapter.page_count }} 页
          </span>
        </p>
      </div>
      <div class="flex items-center gap-1.5">
        <Button size="small" label="继续阅读" @click="read(progress.chapter.id)" />
        <Button
          v-if="first"
          unstyled
          class="shrink-0 cursor-pointer rounded-lg px-3 py-2 text-[13px] text-color transition-colors hover:bg-surface-200 dark:hover:bg-surface-700"
          @click="read(first.id)"
        >
          从头开始
        </Button>
      </div>
    </div>
    <!-- <div class="absolute inset-x-0 bottom-0 h-0.5 bg-surface-200 dark:bg-surface-700">
      <div class="h-full bg-primary" :style="{ width: `${pct}%` }" />
    </div> -->
  </div>
</template>
