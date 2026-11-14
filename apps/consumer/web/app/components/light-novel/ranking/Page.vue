<script setup lang="ts">
  import type { LightNovelsRankingPageData } from '~~/server/api/pages/light-novels/ranking.get'
  import type { RankingPeriod } from '~/features/ranking/ranking'

  defineOptions({ name: 'LightNovelRankingPage' })
  defineProps<{ ranking: LightNovelsRankingPageData['ranking']; pending?: boolean }>()
  const emit = defineEmits<{ update: [period: RankingPeriod] }>()
</script>

<template>
  <RankingShell
    medium="light-novels"
    :period="ranking.period"
    :from="ranking.from"
    :to="ranking.to"
    :count="ranking.items.length"
    :pending="pending"
    @update="emit('update', $event)"
  >
    <LightNovelRankingRow
      v-for="(item, index) in ranking.items"
      :key="item.id"
      :item="item"
      :eager="index < 6"
    />
  </RankingShell>
</template>
