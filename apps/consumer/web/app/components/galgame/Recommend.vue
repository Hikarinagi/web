<script setup lang="ts">
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { recommendSub } from '~/features/recommend/reason'
  import { topVotedMedia } from '~/utils/media/image'
  import { titleOf } from '~/features/galgame/explore'

  type Item = ApiData<'/api/v3/galgames/{id}/recommendations', 'get'>['items'][number]

  defineOptions({ name: 'GalgameRecommend' })
  defineProps<{ workId: number; exclude: number[] }>()
  const shown = defineModel<boolean>('shown', { default: false })
</script>

<template>
  <EntryRecommend
    v-model:shown="shown"
    kind="galgame"
    resource="galgames"
    :work-id="workId"
    :exclude="exclude"
    ratio="3/4"
    :title-of="(item: Item) => titleOf(item)"
    :sub-of="recommendSub"
    :cover-of="(item: Item) => topVotedMedia(item.covers)"
  />
</template>
