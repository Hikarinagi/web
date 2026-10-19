<script setup lang="ts">
  import type { FeedWorkRef } from '~/features/feed/feed'

  const props = defineProps<{ works: FeedWorkRef[]; to: string }>()

  const { shouldBlockNsfw } = useNsfwPolicy()
  const visible = computed(() => props.works.filter(work => !shouldBlockNsfw(work.nsfw)))
  const single = computed(() => (visible.value.length === 1 ? visible.value[0] : null))
</script>

<template>
  <FeedWorkRefCard v-if="single" :work-ref="single" />
  <FeedWorkRefChips v-else-if="visible.length" :works="visible" :to="to" />
</template>
