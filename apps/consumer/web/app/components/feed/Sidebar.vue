<script setup lang="ts">
  import { Panel } from '@hina-ui/vue'
  import type { FeedSidebarData } from '~~/server/features/feed/sidebar'

  defineProps<{ data: FeedSidebarData }>()
</script>

<template>
  <div class="flex flex-col gap-4">
    <FeedSidebarCarousel v-if="data.carousel" :carousel="data.carousel" />

    <template v-if="data.authenticated">
      <Panel
        v-if="data.going.items.length"
        title="正在玩 / 正在读"
        :count="data.going.total"
        :padded="false"
      >
        <FeedSidebarStatusBoard :items="data.going.items" />
      </Panel>

      <Panel v-if="data.followed_topics.items.length" title="关注的话题" :padded="false">
        <FeedSidebarTopicList :topics="data.followed_topics.items" />
      </Panel>
      <Panel v-if="data.hot_topics.length" title="热门话题" :padded="false">
        <FeedSidebarTopicList :topics="data.hot_topics" />
      </Panel>

      <Panel v-if="data.suggestions.length" title="你可能感兴趣" :padded="false">
        <FeedSidebarSuggestedUsers :users="data.suggestions" />
      </Panel>
    </template>

    <template v-else>
      <FeedSidebarLoginCard />
      <Panel v-if="data.hot_topics.length" title="热门话题" :padded="false">
        <FeedSidebarTopicList :topics="data.hot_topics" />
      </Panel>
    </template>
  </div>
</template>
