<script setup lang="ts">
  import { Stack, Text } from '@hina-ui/vue'
  import type { FeedItemByType } from '~/features/feed/feed'

  const props = defineProps<{ item: FeedItemByType<'post'> }>()

  const title = computed(() => props.item.title?.trim() ?? '')
  const excerpt = computed(() => props.item.excerpt?.trim() ?? '')
  const showTitle = computed(() =>
    Boolean(title.value && excerpt.value && !excerpt.value.startsWith(title.value)),
  )
  const body = computed(() => excerpt.value || title.value)
</script>

<template>
  <Stack gap="none" class="gap-3">
    <Text v-if="showTitle" as="p" weight="semibold" class="leading-snug">{{ title }}</Text>
    <Text v-if="body" as="p" class="leading-relaxed whitespace-pre-wrap">{{ body }}</Text>
    <FeedItemCovers :covers="item.covers" :total="item.cover_count" />
    <Stack v-if="item.poll" gap="none" class="relative z-1">
      <HikariContentNodesPollCard :poll="item.poll" />
    </Stack>
  </Stack>
</template>
