<script setup lang="ts">
  import type { TopicPageData } from '~~/server/api/pages/topics/[id].get'
  import { topicFeedSource } from '~/features/feed/sources'

  defineOptions({ name: 'TopicDetail' })

  const props = defineProps<{ initial: TopicPageData; topicId: number }>()
  const topic = computed(() => props.initial.topic)
  const source = topicFeedSource(props.topicId, () => props.initial.feed)
</script>

<template>
  <FeedPageShell>
    <template #top>
      <header class="flex w-full items-start gap-3 px-4 sm:px-0">
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
          class="mt-1"
        />
      </header>
    </template>

    <FeedComposer :topic="{ id: topic.id, name: topic.name }" class="mb-4" />
    <FeedList :source="source" />

    <template #sidebar>
      <FeedSidebar :data="initial.sidebar" />
    </template>
  </FeedPageShell>
</template>
