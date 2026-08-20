<script setup lang="ts">
  import type { TopicPageData } from '~~/server/api/pages/topics/[id].get'
  import type { TopicFeedSort } from '~/features/feed/feed'
  import { topicFeedSource } from '~/features/feed/sources'

  defineOptions({ name: 'TopicDetail' })

  const props = defineProps<{ initial: TopicPageData; topicId: number }>()
  const topic = computed(() => props.initial.topic)
  // 「最新」为默认 tab,BFF 首屏 feed 即 latest;hot 桶切到该 tab 才挂载并拉取。
  const sort = ref<TopicFeedSort>('latest')
  const latestSource = topicFeedSource(props.topicId, () => props.initial.feed, 'latest')
  const hotSource = topicFeedSource(props.topicId, () => undefined, 'hot')
  const hotMounted = ref(false)
  watch(sort, s => {
    if (s === 'hot') hotMounted.value = true
  })
</script>

<template>
  <FeedPageShell>
    <header class="mb-4 flex items-start gap-4">
      <div class="flex min-w-0 flex-1 flex-col gap-2">
        <h1 class="flex items-baseline gap-1 text-2xl font-bold wrap-anywhere text-color">
          <span class="text-primary-500">#</span>
          {{ topic.name }}
        </h1>
        <p v-if="topic.description" class="text-sm leading-relaxed text-muted-color">
          {{ topic.description }}
        </p>
        <div class="flex items-center gap-2 text-xs text-muted-color">
          <span>{{ topic.use_count }} 篇内容</span>
          <span>·</span>
          <span>{{ topic.follow_count }} 关注</span>
        </div>
      </div>
      <FeedFollowButton
        :id="topic.id"
        kind="topic"
        :initial-following="topic.followed"
        class="mt-1 shrink-0"
      />
    </header>

    <FeedComposer :topic="{ id: topic.id, name: topic.name }" class="mb-4" />
    <TopicFeedTabs v-model="sort" class="mb-2" />
    <FeedList v-show="sort === 'latest'" :source="latestSource" :active="sort === 'latest'" />
    <FeedList
      v-if="hotMounted"
      v-show="sort === 'hot'"
      :source="hotSource"
      :active="sort === 'hot'"
    />

    <template #sidebar>
      <FeedSidebar :data="initial.sidebar" />
    </template>
  </FeedPageShell>
</template>
