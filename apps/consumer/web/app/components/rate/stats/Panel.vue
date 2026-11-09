<script setup lang="ts">
  import { Inline, Stack, Tag, Text } from '@hina-ui/vue'
  import { Hash } from '@lucide/vue'
  import type { EntryRating } from '~/components/entry/RatingCard.vue'

  defineOptions({ name: 'RateStatsPanel' })
  defineProps<{
    rating: EntryRating
    keywords?: { word: string; count: number }[]
  }>()
</script>

<template>
  <Stack as="section" gap="lg">
    <EntryRatingCard :rating="rating" plain />
    <slot name="action" />
    <Inline v-if="keywords?.length" gap="xs" align="center">
      <Tag v-for="kw in keywords" :key="kw.word" variant="outline" size="md" class="rounded-xl">
        <Hash class="text-faint" />
        <Text as="span" size="xs" weight="medium">{{ kw.word }}</Text>
        <Text as="span" size="xs" weight="semibold" tone="muted" class="tabular-nums">
          {{ kw.count }}
        </Text>
      </Tag>
    </Inline>
  </Stack>
</template>
