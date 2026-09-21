<script setup lang="ts">
  import { Inline, Link, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { Heart } from '@lucide/vue'
  import type { FeedHotComment } from '~/features/feed/feed'

  defineProps<{ comment: FeedHotComment; to: string }>()
</script>

<template>
  <Link
    :as="NuxtLink"
    :to="to"
    tone="neutral"
    class="group relative z-1 block rounded-lg bg-subtle px-2.5 py-1.5"
  >
    <Inline gap="none" align="center" :wrap="false" class="gap-2">
      <Avatar :user="comment.author" class="size-5! shrink-0" />
      <UserName :user="comment.author" :handle="false" class="shrink-0 text-sm font-medium" />
      <Text
        as="span"
        size="sm"
        tone="muted"
        truncate
        class="min-w-0 flex-1 transition-colors group-hover:text-fg"
      >
        {{ comment.excerpt }}
      </Text>
      <Inline gap="none" align="center" :wrap="false" class="gap-1">
        <Heart class="size-3.5 text-muted" />
        <Text as="span" size="sm" tone="muted" class="tabular-nums">{{ comment.like_count }}</Text>
      </Inline>
    </Inline>
  </Link>
</template>
