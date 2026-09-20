<script setup lang="ts">
  import { cn } from '~/utils/cn'
  import type { MangaPageData } from '~~/server/api/pages/mangas/[id].get'
  import { getMangaEpisodeLabel } from '~/utils/media/manga'

  defineOptions({ name: 'MangaChaptersGrid' })

  const props = withDefaults(
    defineProps<{
      mangaId: number
      chapters: MangaPageData['chapters']
      newChapterId: number | null
      currentChapterId: number | null
      readIds: Set<number>
      volumeIds?: Set<number>
    }>(),
    { volumeIds: () => new Set<number>() },
  )

  function subtitle(chapter: MangaPageData['chapters'][number]) {
    return chapter.chapter_number ? chapter.name_cn || chapter.name || '' : ''
  }

  function cellClass(chapter: MangaPageData['chapters'][number]) {
    const current = chapter.id === props.currentChapterId
    return cn(
      'flex min-w-0 flex-col gap-0.5 rounded-lg border px-3 py-2 text-left transition-[color,background-color,border-color,opacity]',
      current ? 'border-hikari-primary-500 dark:border-hikari-primary-600' : 'border-surface',
      props.volumeIds.has(chapter.id) && 'bg-hikari-primary-50/60 dark:bg-hikari-primary-950/40',
      !chapter.readable && 'cursor-default opacity-55',
      chapter.readable && 'hover:bg-emphasis',
      chapter.readable &&
        !current &&
        props.readIds.has(chapter.id) &&
        'opacity-55 hover:opacity-100',
    )
  }

  function open(chapter: MangaPageData['chapters'][number]) {
    if (!chapter.readable) return
    void navigateTo(`/mangas/${props.mangaId}/read/${chapter.id}`)
  }
</script>

<template>
  <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
    <Button
      v-for="chapter in chapters"
      :key="chapter.id"
      unstyled
      :class="cellClass(chapter)"
      :disabled="!chapter.readable"
      @click="open(chapter)"
    >
      <span class="flex w-full min-w-0 items-center gap-1.5">
        <span
          class="truncate text-sm font-semibold"
          :class="
            chapter.id === currentChapterId
              ? 'text-hikari-primary-800 dark:text-hikari-primary-300'
              : 'text-color'
          "
        >
          {{ getMangaEpisodeLabel(chapter) }}
        </span>
        <Tag
          v-if="chapter.id === newChapterId"
          value="新"
          class="shrink-0 px-1.5! py-0! text-[10px]!"
        />
      </span>
      <span class="flex w-full min-w-0 items-center gap-1.5 text-xs text-muted-color">
        <span v-if="subtitle(chapter)" class="min-w-0 truncate">{{ subtitle(chapter) }}</span>
        <span v-if="chapter.page_count" class="ml-auto shrink-0">{{ chapter.page_count }} P</span>
      </span>
    </Button>
  </div>
</template>
