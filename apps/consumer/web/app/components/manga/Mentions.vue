<script setup lang="ts">
  import { MessageCircle, ThumbsUp } from '@lucide/vue'
  import type { MangaPageData } from '~~/server/api/pages/mangas/[id].get'
  import { timeFromNow } from '~/utils/time-format'

  defineOptions({ name: 'MangaMentions' })
  defineProps<{ posts: MangaPageData['posts'] }>()
</script>

<template>
  <MangaSection
    title="提到这部"
    :meta="`${posts.meta.total_items} 条`"
    :empty="!posts.items.length"
    hide-when-empty
  >
    <div class="flex flex-col">
      <NuxtLink
        v-for="p in posts.items"
        :key="p.id"
        :to="`/posts/${p.id}`"
        class="flex flex-col gap-1.5 border-b border-surface-100 px-3 py-4 transition-colors last:border-b-0 hover:bg-surface-50 dark:border-surface-800 dark:hover:bg-surface-800/30"
      >
        <div class="flex items-center gap-2 text-[13px]">
          <Avatar :user="p.creator" card shape="circle" class="size-6! shrink-0" />
          <UserName
            :user="p.creator"
            class="min-w-0 font-medium text-surface-700 dark:text-surface-200"
          />
          <span class="text-surface-300 dark:text-surface-600">·</span>
          <span class="text-surface-400 dark:text-surface-500">
            {{ timeFromNow(p.created_at) }}
          </span>
        </div>

        <p
          v-if="p.excerpt"
          class="line-clamp-2 text-sm leading-relaxed wrap-anywhere text-surface-700 dark:text-surface-300"
        >
          {{ p.excerpt }}
        </p>

        <div class="flex items-center gap-4 text-xs text-surface-500 dark:text-surface-400">
          <span class="flex items-center gap-1">
            <ThumbsUp class="size-3.5" />
            {{ p.like_count }}
          </span>
          <span class="flex items-center gap-1">
            <MessageCircle class="size-3.5" />
            {{ p.comment_count }}
          </span>
        </div>
      </NuxtLink>
    </div>
  </MangaSection>
</template>
