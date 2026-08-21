<script setup lang="ts">
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
  <div class="flex flex-col gap-3">
    <p v-if="showTitle" class="text-base leading-snug font-semibold text-color">{{ title }}</p>
    <p v-if="body" class="text-[15px] leading-relaxed whitespace-pre-wrap text-color">
      {{ body }}
    </p>
    <FeedItemCovers :covers="item.covers" :total="item.cover_count" />
    <div v-if="item.poll" class="relative z-1">
      <HikariContentNodesPollCard :poll="item.poll" />
    </div>
  </div>
</template>
