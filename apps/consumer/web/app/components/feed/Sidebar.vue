<script setup lang="ts">
  import type { FeedSidebarData } from '~~/server/features/feed/sidebar'

  defineProps<{ data: FeedSidebarData }>()
</script>

<template>
  <div class="flex flex-col gap-4">
    <template v-if="data.authenticated">
      <FeedSidebarPanel
        v-if="data.going.items.length"
        title="正在玩 / 正在读"
        :count="data.going.total"
      >
        <FeedSidebarStatusBoard :items="data.going.items" />
      </FeedSidebarPanel>

      <FeedSidebarPanel v-if="data.hot_topics.length" title="热门话题">
        <FeedSidebarTopicList :topics="data.hot_topics" />
      </FeedSidebarPanel>
      <FeedSidebarPanel v-if="data.followed_topics.items.length" title="关注的话题">
        <FeedSidebarTopicList :topics="data.followed_topics.items" />
      </FeedSidebarPanel>

      <FeedSidebarPanel v-if="data.suggestions.length" title="你可能感兴趣">
        <FeedSidebarSuggestedUsers :users="data.suggestions" />
      </FeedSidebarPanel>
    </template>

    <template v-else>
      <FeedSidebarLoginCard />
      <FeedSidebarPanel v-if="data.hot_topics.length" title="热门话题">
        <FeedSidebarTopicList :topics="data.hot_topics" />
      </FeedSidebarPanel>
    </template>
  </div>
</template>
