<script setup lang="ts">
  import { Heart } from '@lucide/vue'
  import type { FeedHotComment } from '~/features/feed/feed'

  defineProps<{ comment: FeedHotComment; to: string }>()
</script>

<template>
  <NuxtLink
    :to="to"
    class="group bg-emphasis relative z-1 flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm"
  >
    <Avatar :user="comment.author" class="size-5! shrink-0" />
    <UserName :user="comment.author" :handle="false" class="text-color shrink-0 font-medium" />
    <span class="text-muted-color group-hover:text-color min-w-0 flex-1 truncate transition-colors">
      {{ comment.excerpt }}
    </span>
    <span class="text-muted-color flex shrink-0 items-center gap-1 tabular-nums">
      <Heart class="size-3.5" />
      {{ comment.like_count }}
    </span>
  </NuxtLink>
</template>
