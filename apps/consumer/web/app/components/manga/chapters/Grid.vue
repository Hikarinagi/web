<script setup lang="ts">
  import { Card, Grid, IconButton, Inline, Stack, Tag, Text } from '@hina-ui/vue'
  import { Pencil } from '@lucide/vue'
  import { cn } from '~/utils/cn'
  import { TRANSLATION_QUALITY_LABEL } from '~/features/workbench/labels'
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
  const emit = defineEmits<{ edit: [chapter: MangaPageData['chapters'][number]] }>()

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
    <Stack
      v-for="chapter in chapters"
      :key="chapter.id"
      as="span"
      gap="none"
      class="group relative"
    >
      <Card
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
            <template v-if="chapter.translation">
              {{ TRANSLATION_QUALITY_LABEL[chapter.translation] }} ·
            </template>
            {{ chapter.page_count }} P
          </Text>
        </Inline>
      </Card>
      <IconButton
        v-if="chapter.editable"
        label="修改章节信息"
        size="sm"
        variant="soft"
        tone="neutral"
        class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100"
        @click="emit('edit', chapter)"
      >
        <Pencil />
      </IconButton>
    </Stack>
  </Grid>
</template>
