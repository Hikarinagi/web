<script setup lang="ts">
  import { novelWork } from '~/features/landing/works'
  import { statusText } from '~/features/light-novel/explore'
  import type { BackendNovelRankingItem } from '~/features/ranking/ranking'

  defineOptions({ name: 'LightNovelRankingRow' })
  const props = defineProps<{ item: BackendNovelRankingItem; eager?: boolean }>()

  const work = computed(() => novelWork(props.item))
  const note = computed(() =>
    props.item.novel_status && props.item.novel_status !== 'SERIALIZING'
      ? statusText(props.item.novel_status)
      : '',
  )
</script>

<template>
  <RankingRow
    :to="work.to"
    :rank="item.rank"
    :previous="item.previous"
    :title="work.title"
    :original="work.original"
    :author="work.sub"
    :cover="item.volume_cover ?? work.cover"
    :tags="item.tags"
    :score="item.rating.count >= 3 ? item.rating.average : null"
    :detail="item.volume_count ? `${item.volume_count} 卷` : ''"
    :note="note"
    :eager="eager"
  />
</template>
