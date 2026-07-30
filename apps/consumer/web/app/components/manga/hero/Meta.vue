<script setup lang="ts">
  import type { MangaPageData } from '~~/server/api/pages/mangas/[id].get'

  defineOptions({ name: 'MangaHeroMeta' })

  const props = defineProps<{
    manga: MangaPageData['manga']
    people: MangaPageData['people']
    producers: MangaPageData['producers']
    volumeCount: number
  }>()

  const parts = computed(() => {
    const segments: string[] = []
    const authors = props.people
      .filter(item => item.role === 'AUTHOR')
      .map(item =>
        item.person.trans_name && item.person.trans_name !== item.person.name
          ? item.person.trans_name
          : item.person.name,
      )
    if (authors.length) segments.push(authors.join('、'))
    const publisher = props.producers.find(item => item.role === 'PUBLISHER')?.producer.name
    if (publisher) segments.push(publisher)
    const year = props.manga.publication_date?.slice(0, 4)
    if (year) segments.push(`${year} 年`)
    if (props.volumeCount) segments.push(`单行本 ${props.volumeCount} 卷`)
    return segments
  })
</script>

<template>
  <p v-if="parts.length" class="text-[15px] text-surface-600 dark:text-surface-300">
    {{ parts.join('  ·  ') }}
  </p>
</template>
