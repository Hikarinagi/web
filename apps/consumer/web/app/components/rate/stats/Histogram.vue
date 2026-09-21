<script setup lang="ts">
  import { Inline, Stack, Text } from '@hina-ui/vue'

  defineOptions({ name: 'RateStatsHistogram' })

  const props = defineProps<{ rows: { score: number; count: number }[] }>()

  const bars = computed(() => {
    const max = Math.max(1, ...props.rows.map(r => r.count))
    return props.rows.map(r => ({
      ...r,
      peak: r.count === max,
      height: `${Math.max(10, Math.round((r.count / max) * 100))}%`,
    }))
  })
</script>

<template>
  <Inline gap="xs" align="stretch" :wrap="false" class="w-full">
    <Stack
      v-for="bar in bars"
      :key="bar.score"
      v-tooltip="`${bar.score} 分 · ${bar.count} 人`"
      gap="xs"
      align="center"
      class="max-w-12 min-w-0 flex-1"
    >
      <Inline gap="none" align="end" :wrap="false" class="h-12 w-full">
        <Stack
          gap="none"
          class="w-full rounded-sm transition-colors"
          :class="bar.peak ? 'bg-accent' : 'bg-accent/30'"
          :style="{ height: bar.height }"
        />
      </Inline>
      <Text
        as="span"
        size="xs"
        class="tabular-nums"
        :tone="bar.peak ? 'default' : 'faint'"
        :weight="bar.peak ? 'semibold' : 'normal'"
      >
        {{ bar.score }}
      </Text>
    </Stack>
  </Inline>
</template>
