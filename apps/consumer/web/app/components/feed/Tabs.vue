<script setup lang="ts">
  import { motion } from 'motion-v'
  import type { FeedScope } from '~/features/feed/feed'
  import { useFeedTabs } from '~/features/feed/useFeedTabs'
  import { TRANSITION } from '~/lib/motion'

  const scope = defineModel<FeedScope>({ required: true })
  const props = withDefaults(
    defineProps<{ topicCount?: number; orientation?: 'horizontal' | 'vertical' }>(),
    { topicCount: 0, orientation: 'horizontal' },
  )
  const emit = defineEmits<{ select: [FeedScope] }>()

  const { tabs, select } = useFeedTabs(scope, key => emit('select', key))

  const indicatorId = computed(() => `feed-tab-indicator-${props.orientation}`)
</script>

<template>
  <div
    v-if="orientation === 'horizontal'"
    role="tablist"
    class="app-surface-blur sticky top-(--app-header-height) z-30 flex h-(--feed-tabs-height) items-end gap-8"
  >
    <motion.button
      v-for="tab in tabs"
      :key="tab.key"
      type="button"
      role="tab"
      :aria-selected="scope === tab.key"
      class="group relative flex cursor-pointer flex-col items-center gap-2 rounded outline-none focus-visible:ring-2 focus-visible:ring-primary-200 dark:focus-visible:ring-primary-900"
      :while-press="{ opacity: 0.7 }"
      @click="select(tab.key)"
    >
      <span
        class="text-sm transition-colors duration-150"
        :class="
          scope === tab.key
            ? 'font-bold text-color'
            : 'font-medium text-muted-color group-hover:text-color'
        "
      >
        {{ tab.label }}
      </span>
      <span class="relative h-0.5 w-6">
        <motion.span
          v-if="scope === tab.key"
          :layout-id="indicatorId"
          class="absolute inset-0 rounded-full bg-primary"
          :transition="TRANSITION"
        />
      </span>
    </motion.button>

    <span v-if="topicCount" class="ml-auto self-center text-xs text-muted-color">
      你关注 {{ topicCount }} 个话题
    </span>
  </div>

  <div v-else role="tablist" aria-orientation="vertical" class="flex flex-col gap-1">
    <motion.button
      v-for="tab in tabs"
      :key="tab.key"
      type="button"
      role="tab"
      :aria-selected="scope === tab.key"
      class="group relative flex cursor-pointer items-center gap-3 rounded-lg py-2.5 pr-3 pl-4 transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-primary-200 dark:focus-visible:ring-primary-900"
      :class="scope === tab.key ? 'text-color' : 'text-muted-color hover:bg-emphasis'"
      :while-press="{ opacity: 0.7 }"
      @click="select(tab.key)"
    >
      <motion.span
        v-if="scope === tab.key"
        :layout-id="indicatorId"
        class="absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary"
        :transition="TRANSITION"
      />
      <component :is="tab.icon" class="size-4 shrink-0" aria-hidden="true" />
      <span class="text-sm" :class="scope === tab.key ? 'font-bold' : 'font-medium'">
        {{ tab.label }}
      </span>
    </motion.button>

    <p v-if="topicCount" class="mt-2 px-4 text-xs text-muted-color">
      你关注 {{ topicCount }} 个话题
    </p>
  </div>
</template>
