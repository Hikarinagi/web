<script setup lang="ts">
  import { Inline, Link, Stack, Tag } from '@hina-ui/vue'
  import { Hash } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { PostPageData } from '~~/server/api/pages/posts/[id].get'

  const props = defineProps<{ post: PostPageData['post']; favorited?: boolean }>()

  const pickerTitle = computed(
    () => `将这篇${props.post.covers.length > 0 ? '图文' : '短文'}添加到收藏夹`,
  )
</script>

<template>
  <Stack gap="none" class="gap-5">
    <Inline
      v-if="post.topics.length || post.sections.length"
      gap="none"
      align="center"
      class="gap-x-3 gap-y-2"
    >
      <Link
        v-for="t in post.topics"
        :key="`t${t.topic.id}`"
        :as="NuxtLink"
        :to="`/topics/${t.topic.id}`"
        class="inline-flex items-center gap-0.5 text-sm"
      >
        <Hash class="size-3.5" />
        {{ t.topic.name }}
      </Link>
      <Tag
        v-for="s in post.sections"
        :key="`s${s.section.id}`"
        :as="NuxtLink"
        :to="`/sections/${s.section.id}`"
        pill
        class="hn-state-layer hn-interactive px-2.5 text-muted"
      >
        {{ s.section.name }}
      </Tag>
    </Inline>
    <PostActionBar
      :post-id="post.id"
      :like-count="post.like_count"
      :liked="post.liked"
      :favorited="favorited"
      :picker-title="pickerTitle"
    />
  </Stack>
</template>
