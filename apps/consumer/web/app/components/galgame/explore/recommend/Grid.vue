<script setup lang="ts">
  import { Grid } from '@hina-ui/vue'
  import type { GalgameStreamData } from '~~/server/api/pages/galgames/stream.get'
  import { producerText, titleOf } from '~/features/galgame/explore'
  import { topVotedMedia } from '~/utils/media/image'

  defineOptions({ name: 'GalgameExploreRecommendGrid' })
  defineProps<{
    items: Extract<GalgameStreamData['modules'][number], { kind: 'grid' }>['items']
  }>()
</script>

<template>
  <Grid v-if="items.length" :cols="3" class="gap-x-4 gap-y-7 sm:grid-cols-4 lg:grid-cols-6">
    <BrowseWorkCard
      v-for="item in items"
      :key="item.id"
      :to="`/galgames/${item.id}`"
      :title="titleOf(item)"
      :sub="producerText(item)"
      :cover="topVotedMedia(item.covers)"
      ratio="3/4"
    />
  </Grid>
</template>
