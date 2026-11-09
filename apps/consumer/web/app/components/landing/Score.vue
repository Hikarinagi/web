<script setup lang="ts">
  import { Inline, Tag, Text } from '@hina-ui/vue'
  import { Star } from '@lucide/vue'

  defineOptions({ name: 'LandingScore' })
  defineProps<{ score: number; rated?: number }>()
</script>

<template>
  <Inline gap="sm" align="center" :wrap="false">
    <Tag tone="warning" size="sm" class="gap-1 text-warning tabular-nums">
      <Star class="size-3 fill-current" />
      {{ score.toFixed(1) }}
    </Tag>
    <Text v-if="rated" size="xs" tone="muted" class="tabular-nums">{{ rated }} 人评分</Text>
  </Inline>
</template>
