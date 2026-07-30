<script setup lang="ts">
  import { Hash } from '@lucide/vue'
  import type { SidebarTopic } from '~/features/feed/sidebar'

  defineProps<{ topics: SidebarTopic[] }>()
</script>

<template>
  <ul class="pb-1.5">
    <li v-for="topic in topics" :key="topic.id">
      <NuxtLink
        :to="`/topics/${topic.id}`"
        class="flex items-center gap-2.5 px-4 py-2.5 transition-colors hover:bg-surface-50 dark:hover:bg-surface-800/50"
      >
        <Hash :size="14" class="shrink-0 text-muted-color" />
        <span class="min-w-0 flex-1 truncate text-[13px] font-medium text-color">
          {{ topic.name }}
        </span>
        <span
          class="shrink-0 rounded bg-primary-100 px-1.5 py-px text-[11px] font-semibold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
        >
          {{ topic.use_count }}
        </span>
      </NuxtLink>
    </li>
  </ul>
</template>
