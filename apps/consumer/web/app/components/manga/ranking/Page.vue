<script setup lang="ts">
  import type { MangasRankingPageData } from '~~/server/api/pages/mangas/ranking.get'
  import type { RankingPeriod } from '~/features/ranking/ranking'

  defineOptions({ name: 'MangaRankingPage' })
  defineProps<{ ranking: MangasRankingPageData['ranking']; pending?: boolean }>()
  const emit = defineEmits<{ update: [period: RankingPeriod] }>()
</script>

<template>
  <RankingShell
    medium="mangas"
    :period="ranking.period"
    :from="ranking.from"
    :to="ranking.to"
    :count="ranking.items.length"
    :pending="pending"
    @update="emit('update', $event)"
  >
    <MangaRankingRow
      v-for="(item, index) in ranking.items"
      :key="item.id"
      :item="item"
      :eager="index < 6"
    />
  </RankingShell>
</template>
