<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import type { MangaPageData } from '~~/server/api/pages/mangas/[id].get'
  import { tagRoute } from '~/features/manga/explore'

  defineOptions({ name: 'MangaAboutIntro' })

  const props = defineProps<{
    manga: MangaPageData['manga']
    tags: MangaPageData['tags']
  }>()

  const primary = computed(() => props.manga.summary_cn || props.manga.summary)
  const jp = computed(() =>
    props.manga.summary_cn && props.manga.summary && props.manga.summary !== props.manga.summary_cn
      ? props.manga.summary
      : '',
  )
  const tagLinks = computed(() =>
    props.tags.map(item => ({
      id: item.tag.id,
      name: item.tag.name,
      to: tagRoute(item.tag.id),
    })),
  )
</script>

<template>
  <Stack gap="none" class="min-w-0 flex-1 gap-5">
    <WorkIntro :text="primary" :original="jp" empty-text="还没有收录简介" />
    <WorkTagLinks :tags="tagLinks" />
  </Stack>
</template>
