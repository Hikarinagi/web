<script setup lang="ts">
  import { Card, Grid, Inline, Tag, Text } from '@hina-ui/vue'
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
      'flex min-w-0 flex-col gap-0.5 px-3 py-2 text-left shadow-none',
      'transition-[color,background-color,border-color,opacity]',
      current && 'border-accent',
      props.volumeIds.has(chapter.id) && 'bg-accent-soft',
      !chapter.readable && 'cursor-default opacity-55',
      chapter.readable && 'hn-state-layer hn-interactive hn-press-none',
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
  <Grid :cols="2" class="gap-2 sm:grid-cols-3 lg:grid-cols-4">
    <Card
      v-for="chapter in chapters"
      :key="chapter.id"
      as="button"
      :padded="false"
      :class="cellClass(chapter)"
      :disabled="!chapter.readable"
      @click="open(chapter)"
    >
      <Inline gap="none" :wrap="false" class="w-full min-w-0 gap-1.5">
        <Text
          as="span"
          size="sm"
          weight="semibold"
          truncate
          :class="chapter.id === currentChapterId ? 'text-accent-text' : undefined"
        >
          {{ getMangaEpisodeLabel(chapter) }}
        </Text>
        <Tag v-if="chapter.id === newChapterId" tone="accent" class="shrink-0">新</Tag>
      </Inline>
      <Inline gap="none" :wrap="false" class="w-full min-w-0 gap-1.5">
        <Text v-if="subtitle(chapter)" as="span" size="xs" tone="muted" truncate class="min-w-0">
          {{ subtitle(chapter) }}
        </Text>
        <Text v-if="chapter.page_count" as="span" size="xs" tone="muted" class="ms-auto shrink-0">
          {{ chapter.page_count }} P
        </Text>
      </Inline>
    </Card>
  </Grid>
</template>
