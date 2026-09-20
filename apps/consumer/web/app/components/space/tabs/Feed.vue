<script setup lang="ts">
  import { Activity } from '@lucide/vue'
  import type { BackendFeedItem, FeedResponse } from '~/features/feed/feed'
  import { useSpaceFeed } from '~/features/space/useSpaceFeed'

  defineOptions({ name: 'SpaceTabsFeed' })

  const props = defineProps<{
    userId: number
    isSelf: boolean
    feed: FeedResponse
  }>()

  const { items, nextCursor, loading, loadMore } = useSpaceFeed(props.userId, props.feed)

  const sentinel = ref<HTMLElement | null>(null)
  useIntersectionObserver(
    sentinel,
    ([entry]) => {
      if (entry?.isIntersecting && !loading.value && nextCursor.value) loadMore()
    },
    { rootMargin: '400px' },
  )

  const feedKey = (item: BackendFeedItem) => `${item.type}:${item.id}`
</script>

<template>
  <div v-if="items.length">
    <div class="flex flex-col">
      <SpaceFeedItem v-for="item in items" :key="feedKey(item)" :item="item" />
    </div>
    <div ref="sentinel" class="h-px" />
    <div v-if="loading" class="flex justify-center py-6">
      <Spinner :size="28" />
    </div>
  </div>
  <SpaceEmptyState
    v-else
    :icon="Activity"
    :text="isSelf ? '你还没有任何动态' : 'TA 还没有任何动态'"
  />
</template>
