<script setup lang="ts">
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { recommendSub } from '~/features/recommend/reason'
  import { topVotedMedia } from '~/utils/media/image'

  type Item = ApiData<'/api/v3/mangas/{id}/recommendations', 'get'>['items'][number]

  defineOptions({ name: 'MangaRecommend' })
  defineProps<{ workId: number; exclude: number[] }>()
</script>

<template>
  <EntryRecommend
    kind="manga"
    resource="mangas"
    :work-id="workId"
    :exclude="exclude"
    ratio="2/3"
    :title-of="(item: Item) => item.name_cn || item.name"
    :sub-of="recommendSub"
    :cover-of="(item: Item) => topVotedMedia(item.covers)"
  />
</template>
