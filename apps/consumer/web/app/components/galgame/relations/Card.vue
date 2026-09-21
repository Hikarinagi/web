<script setup lang="ts">
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'
  import { relationLabel } from '~/features/galgame/labels'
  import { topVotedMedia } from '~/utils/media/image'

  defineOptions({ name: 'GalgameRelationsCard' })
  const props = defineProps<{ item: GalgamePageData['relations'][number] }>()

  const target = computed(() => props.item.target_galgame)
  const title = computed(() => target.value.trans_title || target.value.origin_title)
  const cover = computed(() => topVotedMedia(target.value.covers))
  const year = computed(() => {
    if (!target.value.release_date) return null
    const d = new Date(target.value.release_date)
    return Number.isNaN(d.getTime()) ? null : d.getFullYear()
  })
</script>

<template>
  <WorkRelationCard
    :to="`/galgames/${target.id}`"
    :title="title"
    :label="relationLabel(item.relation)"
    :cover="cover"
    :year="year"
    aspect="3/4"
  />
</template>
