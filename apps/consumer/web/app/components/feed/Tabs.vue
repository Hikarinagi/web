<script setup lang="ts">
  import { motion } from 'motion-v'
  import type { FeedScope } from '~/features/feed/feed'
  import { TRANSITION } from '~/lib/motion'

  const scope = defineModel<FeedScope>({ required: true })
  defineProps<{ topicCount?: number }>()

  const auth = useAuthStore()
  const { toLogin } = useAuthGate()
  const { currentPath } = useAuthReturn()

  const TABS = [
    { key: 'recommend', label: '最新', auth: false },
    { key: 'following', label: '关注', auth: true },
  ] as const

  function select(tab: (typeof TABS)[number]) {
    if (tab.auth && !auth.isAuthenticated) {
      toLogin('login', currentPath.value)
      return
    }
    scope.value = tab.key
  }
</script>

<template>
  <div
    role="tablist"
    class="flex items-center gap-8 border-b border-surface-200 dark:border-surface-800"
  >
    <motion.button
      v-for="tab in TABS"
      :key="tab.key"
      type="button"
      role="tab"
      :aria-selected="scope === tab.key"
      class="group relative flex cursor-pointer flex-col items-center gap-2 rounded pt-1 outline-none focus-visible:ring-2 focus-visible:ring-primary-200 dark:focus-visible:ring-primary-900"
      :while-press="{ opacity: 0.7 }"
      @click="select(tab)"
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
          layout-id="feed-tab-indicator"
          class="absolute inset-0 rounded-full bg-primary"
          :transition="TRANSITION"
        />
      </span>
    </motion.button>

    <span v-if="topicCount" class="ml-auto text-[13px] text-muted-color">
      你关注 {{ topicCount }} 个话题
    </span>
  </div>
</template>
