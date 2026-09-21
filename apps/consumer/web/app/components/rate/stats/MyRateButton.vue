<script setup lang="ts">
  import { Pencil, Star } from '@lucide/vue'

  defineOptions({ name: 'RateStatsMyRateButton' })
  defineProps<{ score: number | null }>()
</script>

<template>
  <Button login-required variant="outline" tone="neutral" class="w-full">
    <template #icon>
      <Star :class="score != null ? 'fill-current text-warning' : ''" />
    </template>
    <template v-if="score != null">我的评分 {{ score.toFixed(1) }}</template>
    <template v-else>我来评分</template>
    <template v-if="score != null" #trailing>
      <Pencil class="text-muted" />
    </template>
  </Button>
</template>
