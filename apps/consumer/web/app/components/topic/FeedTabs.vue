<script setup lang="ts">
  import { motion } from 'motion-v'
  import type { TopicFeedSort } from '~/features/feed/feed'
  import { TRANSITION } from '~/lib/motion'

  const sort = defineModel<TopicFeedSort>({ required: true })

  const TABS = [
    { key: 'latest', label: '最新' },
    { key: 'hot', label: '热门' },
  ] as const
</script>

<template>
  <div role="tablist" class="flex items-center gap-8 border-b border-surface">
    <motion.button
      v-for="tab in TABS"
      :key="tab.key"
      type="button"
      role="tab"
      :aria-selected="sort === tab.key"
      class="group relative flex cursor-pointer flex-col items-center gap-2 rounded pt-1 outline-none focus-visible:ring-2 focus-visible:ring-primary-200 dark:focus-visible:ring-primary-900"
      :while-press="{ opacity: 0.7 }"
      @click="sort = tab.key"
    >
      <span
        class="text-sm transition-colors duration-150"
        :class="
          sort === tab.key
            ? 'font-bold text-color'
            : 'font-medium text-muted-color group-hover:text-color'
        "
      >
        {{ tab.label }}
      </span>
      <span class="relative h-0.5 w-6">
        <motion.span
          v-if="sort === tab.key"
          layout-id="topic-feed-tab-indicator"
          class="absolute inset-0 rounded-full bg-primary"
          :transition="TRANSITION"
        />
      </span>
    </motion.button>
  </div>
</template>
