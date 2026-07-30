<script setup lang="ts">
  import type { LightNovelPageData } from '~~/server/api/pages/light-novels/[id].get'

  const props = defineProps<{
    lightNovel: LightNovelPageData['light_novel']
    people: LightNovelPageData['people']
    producers: LightNovelPageData['producers']
    volumeCount: number
  }>()

  const parts = computed(() => {
    const segments: string[] = []
    const authors = props.people
      .filter(item => item.relation === 'author')
      .map(item =>
        item.person.trans_name && item.person.trans_name !== item.person.name
          ? item.person.trans_name
          : item.person.name,
      )
    if (authors.length) segments.push(authors.join('、'))
    const bunko = props.producers.find(item => item.relation === 'bunko')?.producer.name
    if (bunko) segments.push(bunko)
    if (props.volumeCount) segments.push(`全 ${props.volumeCount} 卷`)
    const year = props.lightNovel.publication_date?.slice(0, 4)
    if (year) segments.push(`${year} 年`)
    return segments
  })
</script>

<template>
  <p v-if="parts.length" class="text-[15px] text-surface-600 dark:text-surface-300">
    {{ parts.join('  ·  ') }}
  </p>
</template>
