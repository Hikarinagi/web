<script setup lang="ts">
  import { Text } from '@hina-ui/vue'

  defineOptions({ name: 'MangaRankingFacts' })
  defineProps<{
    rated: { average: number | null; count: number } | null
    author?: string
    status?: string
    chapter?: string
    updated?: string
  }>()
</script>

<template>
  <LandingScore
    v-if="rated && rated.average !== null"
    :score="rated.average"
    :rated="rated.count"
  />
  <Text v-if="author" size="xs" tone="muted" lang="ja">{{ author }}</Text>
  <Text v-if="status" size="xs" tone="muted">{{ status }}</Text>
  <Text v-if="chapter" size="xs" tone="muted" class="tabular-nums">{{ chapter }}</Text>
  <Text v-if="updated" size="xs" tone="faint" class="tabular-nums">{{ updated }}</Text>
</template>
