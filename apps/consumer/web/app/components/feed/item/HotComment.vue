<script setup lang="ts">
  import { ThumbsUp } from '@lucide/vue'
  import type { FeedHotComment } from '~/features/feed/feed'

  defineProps<{ comment: FeedHotComment; to: string }>()
</script>

<template>
  <NuxtLink
    :to="to"
    class="group relative z-1 flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm bg-emphasis"
  >
    <Avatar :user="comment.author" shape="circle" class="size-5! shrink-0" />
    <UserName :user="comment.author" :handle="false" class="shrink-0 font-medium text-color" />
    <span class="min-w-0 flex-1 truncate text-muted-color transition-colors group-hover:text-color">
      {{ comment.excerpt }}
    </span>
    <span class="flex shrink-0 items-center gap-1 text-muted-color tabular-nums">
      <ThumbsUp class="size-3.5" />
      {{ comment.like_count }}
    </span>
  </NuxtLink>
</template>
