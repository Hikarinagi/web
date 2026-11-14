<script setup lang="ts">
  import { Text } from '@hina-ui/vue'

  defineOptions({ name: 'LightNovelRankingFacts' })
  defineProps<{
    rated: { average: number | null; count: number } | null
    author?: string
    bunko?: string
    volumes: number
    status?: string
  }>()
</script>

<template>
  <LandingScore
    v-if="rated && rated.average !== null"
    :score="rated.average"
    :rated="rated.count"
  />
  <Text v-if="author" size="xs" tone="muted" lang="ja">{{ author }}</Text>
  <Text v-if="bunko" size="xs" tone="muted" lang="ja">{{ bunko }}</Text>
  <Text v-if="volumes" size="xs" tone="muted" class="tabular-nums">{{ volumes }} 卷</Text>
  <Text v-if="status" size="xs" tone="faint">{{ status }}</Text>
</template>
