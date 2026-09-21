<script setup lang="ts">
  import { Center, Spinner, Stack, Text } from '@hina-ui/vue'
  import { AnimatePresence, motion } from 'motion-v'
  import type { FeedSource } from '~/features/feed/sources'
  import { useFeedList } from '~/features/feed/useFeedList'
  import { TRANSITION, TRANSITION_FAST } from '~/lib/motion'

  const props = withDefaults(defineProps<{ source: FeedSource; active?: boolean }>(), {
    active: true,
  })
  const active = toRef(props, 'active')
  const {
    emptyText,
    itemCount,
    loading,
    nextCursor,
    pinnedRows,
    sentinel,
    setVirtualRoot,
    setVirtualRow,
    showFooterLoading,
    topRefreshOpen,
    topRefreshY,
    virtualRows,
    virtualStyle,
  } = useFeedList(props.source, active)
</script>

<template>
  <div class="relative [overflow-anchor:none]">
    <AnimatePresence :initial="false">
      <motion.div
        v-if="topRefreshOpen"
        key="top-refresh"
        class="pointer-events-none absolute inset-x-0 top-0 z-1 flex h-16 items-center justify-center"
        :initial="{ opacity: 0, scale: 0.94 }"
        :animate="{ opacity: 1, scale: 1 }"
        :exit="{ opacity: 0, scale: 0.94 }"
        :transition="TRANSITION_FAST"
      >
        <Spinner size="lg" />
      </motion.div>
    </AnimatePresence>

    <motion.div :animate="{ y: topRefreshY }" :transition="TRANSITION">
      <FeedSkeleton v-if="loading && !itemCount && !topRefreshOpen" />

      <template v-else>
        <Stack v-if="pinnedRows.length" gap="none">
          <Stack
            v-for="r in pinnedRows"
            :key="r.key"
            gap="none"
            class="border-line"
            :class="r.index > 0 ? 'border-t' : ''"
          >
            <FeedCluster :cluster="r.cluster" />
          </Stack>
        </Stack>

        <div :ref="setVirtualRoot" class="relative [overflow-anchor:none]" :style="virtualStyle">
          <div
            v-for="r in virtualRows"
            :key="r.key"
            :ref="el => setVirtualRow(r.key, r.index, el)"
            class="absolute inset-x-0 border-line"
            :class="{ 'border-t': r.index > 0 }"
            :style="r.style"
          >
            <FeedCluster :cluster="r.cluster" />
          </div>
        </div>

        <div
          v-if="nextCursor && !showFooterLoading"
          ref="sentinel"
          class="h-px [overflow-anchor:none]"
        />

        <Center v-if="showFooterLoading" class="py-6 [overflow-anchor:none]">
          <Spinner size="lg" />
        </Center>
        <Text
          v-else-if="!nextCursor && itemCount"
          as="p"
          size="sm"
          tone="muted"
          class="py-6 text-center [overflow-anchor:none]"
        >
          没有更多了
        </Text>
        <Text v-else-if="!itemCount" as="p" size="sm" tone="muted" class="py-16 text-center">
          {{ emptyText }}
        </Text>
      </template>
    </motion.div>
  </div>
</template>
