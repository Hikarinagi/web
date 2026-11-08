<script setup lang="ts">
  import type { LightNovelPageData } from '~~/server/api/pages/light-novels/[id].get'
  import { getNovelRelationLabel } from '~/labels/work'
  import { topVotedMedia } from '~/utils/media/image'

  defineOptions({ name: 'LightNovelRelationsCard' })
  const props = defineProps<{ item: LightNovelPageData['relations'][number] }>()

  const target = computed(() => props.item.target_light_novel)
  const title = computed(() => target.value.name_cn || target.value.name)
  const cover = computed(() => topVotedMedia(target.value.covers))
  const year = computed(() => {
    if (!target.value.publication_date) return null
    const d = new Date(target.value.publication_date)
    return Number.isNaN(d.getTime()) ? null : d.getFullYear()
  })
</script>

<template>
  <WorkRelationCard
    :to="`/light-novels/${target.id}`"
    :title="title"
    :label="getNovelRelationLabel(item.relation)"
    :cover="cover"
    :year="year"
    aspect="7/10"
  />
</template>
