<script setup lang="ts">
  import { Card, Divider, Grid, Inline, Progress, Rating, Stack, Text } from '@hina-ui/vue'

  export interface EntryRating {
    average: number | null
    rated: number
    distribution: { score: number; count: number }[]
    dimensions: { label: string; value: number | null }[]
    statuses: { label: string; count: number }[]
  }

  defineOptions({ name: 'EntryRatingCard' })
  const props = defineProps<{ rating: EntryRating; plain?: boolean }>()

  const peak = computed(() => Math.max(...props.rating.distribution.map(item => item.count), 1))
  const bars = computed(() =>
    Array.from({ length: 10 }, (_, index) => {
      const score = index + 1
      const count = props.rating.distribution.find(item => item.score === score)?.count ?? 0
      return { score, count }
    }),
  )
  const dimensions = computed(() => props.rating.dimensions.filter(item => item.value !== null))
</script>

<template>
  <component :is="plain ? Stack : Card" :gap="plain ? 'none' : undefined">
    <Stack gap="lg">
      <Inline gap="md" align="center" :wrap="false">
        <Text class="text-4xl leading-none font-semibold tracking-tight tabular-nums">
          {{ rating.average?.toFixed(1) ?? '—' }}
        </Text>
        <Stack gap="xs">
          <Rating
            :model-value="rating.average ?? 0"
            :max="10"
            :stars="5"
            :step="0.5"
            readonly
            size="sm"
          />
          <Text size="xs" tone="muted" class="tabular-nums">{{ rating.rated }} 人评分</Text>
        </Stack>
      </Inline>

      <Stack v-if="rating.rated" gap="xs">
        <Inline gap="xs" align="end" :wrap="false" class="h-16">
          <Stack
            v-for="item in bars"
            :key="item.score"
            v-tooltip="`${item.score} 分，${item.count} 人`"
            gap="none"
            :class="cn('flex-1 rounded-sm', item.count === peak ? 'bg-accent' : 'bg-accent/45')"
            :style="{ height: `max(2px, ${(item.count / peak) * 100}%)` }"
          />
        </Inline>
        <Inline justify="between">
          <Text size="xs" tone="muted">1 分</Text>
          <Text size="xs" tone="muted">10 分</Text>
        </Inline>
      </Stack>

      <template v-if="dimensions.length">
        <Divider />
        <Stack gap="sm">
          <Inline
            v-for="item in dimensions"
            :key="item.label"
            gap="sm"
            align="center"
            :wrap="false"
          >
            <Text size="sm" tone="muted" class="w-8 shrink-0">{{ item.label }}</Text>
            <Progress
              :value="item.value ?? 0"
              :max="10"
              size="sm"
              class="flex-1"
              :aria-label="item.label"
            />
            <Text size="sm" weight="medium" class="w-7 text-right tabular-nums">
              {{ item.value?.toFixed(1) }}
            </Text>
          </Inline>
        </Stack>
      </template>

      <Divider />

      <Grid :cols="5" gap="xs">
        <Stack v-for="item in rating.statuses" :key="item.label" gap="none" align="center">
          <Text weight="semibold" class="tabular-nums">{{ item.count }}</Text>
          <Text size="xs" tone="muted">{{ item.label }}</Text>
        </Stack>
      </Grid>
    </Stack>
  </component>
</template>
