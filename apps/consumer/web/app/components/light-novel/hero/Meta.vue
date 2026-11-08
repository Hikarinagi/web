<script setup lang="ts">
  import { Text } from '@hina-ui/vue'
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
  <Text v-if="parts.length" tone="muted">{{ parts.join('  ·  ') }}</Text>
</template>
