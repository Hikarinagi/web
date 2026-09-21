<script setup lang="ts">
  import { Heading, Inline, Stack, Text } from '@hina-ui/vue'
  import { Hash } from '@lucide/vue'
  import type { TopicPageData } from '~~/server/api/pages/topics/[id].get'
  import { topicFeedSource } from '~/features/feed/sources'

  defineOptions({ name: 'TopicDetail' })

  const props = defineProps<{ initial: TopicPageData; topicId: number }>()
  const topic = computed(() => props.initial.topic)
  const source = topicFeedSource(props.topicId, () => props.initial.feed)
</script>

<template>
  <FeedPageShell>
    <Inline as="header" gap="md" align="start" :wrap="false" class="mb-4">
      <Stack gap="sm" class="min-w-0 flex-1">
        <Heading :level="1" size="2xl" class="flex items-center gap-1.5 font-bold wrap-anywhere">
          <Hash class="size-6 shrink-0 text-accent-text" aria-hidden="true" />
          {{ topic.name }}
        </Heading>
        <Text v-if="topic.description" as="p" size="sm" tone="muted" class="leading-relaxed">
          {{ topic.description }}
        </Text>
        <Inline gap="sm" align="center" :wrap="false">
          <Text as="span" size="xs" tone="muted">{{ topic.use_count }} 篇内容</Text>
          <Text as="span" size="xs" tone="muted">·</Text>
          <Text as="span" size="xs" tone="muted">{{ topic.follow_count }} 关注</Text>
        </Inline>
      </Stack>

      <FeedFollowButton
        :id="topic.id"
        kind="topic"
        :initial-following="topic.followed"
        class="mt-1 shrink-0"
      />
    </Inline>

    <FeedComposer :topic="{ id: topic.id, name: topic.name }" class="mb-4" />
    <FeedList :source="source" />

    <template #sidebar>
      <FeedSidebar :data="initial.sidebar" />
    </template>
  </FeedPageShell>
</template>
