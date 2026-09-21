<script setup lang="ts">
  import { Card, Divider, Heading, Inline, Rating, Stack, Tag, Text } from '@hina-ui/vue'
  import { Hash } from '@lucide/vue'

  defineOptions({ name: 'RateStatsPanel' })

  const props = defineProps<{
    title: string
    average: number | null
    ratedCount: number
    countLabel: string
    distribution: { score: number; count: number }[]
    statuses: { key: string; label: string; count: number }[]
    keywords?: { word: string; count: number }[]
  }>()

  const scored = computed(() =>
    props.distribution.filter(d => d.count > 0).sort((a, b) => a.score - b.score),
  )
  const showHistogram = computed(() => props.ratedCount >= 4 && scored.value.length >= 2)

  const activeStatuses = computed(() => props.statuses.filter(s => s.count > 0))
</script>

<template>
  <Card as="section">
    <Stack gap="md">
      <Heading :level="2" size="lg">{{ title }}</Heading>

      <Stack gap="xs" align="start">
        <Inline gap="xs" align="baseline" :wrap="false">
          <Text as="span" weight="semibold" class="text-5xl leading-none tabular-nums">
            {{ average != null ? average.toFixed(1) : '—' }}
          </Text>
          <Text as="span" size="sm" tone="muted">/ 10</Text>
        </Inline>
        <Rating :model-value="average ?? 0" :max="10" readonly size="sm" />
        <Text as="span" size="xs" tone="muted">{{ countLabel }}</Text>
      </Stack>

      <RateStatsHistogram v-if="showHistogram" :rows="scored" />

      <slot name="action" />

      <template v-if="activeStatuses.length">
        <Divider />
        <Stack gap="xs">
          <Inline
            v-for="s in activeStatuses"
            :key="s.key"
            gap="sm"
            align="baseline"
            justify="between"
            :wrap="false"
          >
            <Text as="span" size="sm" tone="muted">{{ s.label }}</Text>
            <Text as="span" size="sm" weight="medium" class="tabular-nums">{{ s.count }}</Text>
          </Inline>
        </Stack>
      </template>

      <template v-if="keywords?.length">
        <Divider />
        <Inline gap="xs" align="center" wrap>
          <Tag v-for="kw in keywords" :key="kw.word" variant="outline" size="md" class="rounded-xl">
            <Hash class="text-faint" />
            <Text as="span" size="xs" weight="medium">{{ kw.word }}</Text>
            <Text as="span" size="xs" weight="semibold" tone="muted" class="tabular-nums">
              {{ kw.count }}
            </Text>
          </Tag>
        </Inline>
      </template>
    </Stack>
  </Card>
</template>
