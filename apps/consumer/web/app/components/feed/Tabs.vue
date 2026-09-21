<script setup lang="ts">
  import { Highlight, Inline, Stack, Text } from '@hina-ui/vue'
  import { motion } from 'motion-v'
  import type { FeedScope } from '~/features/feed/feed'
  import { useFeedTabs } from '~/features/feed/useFeedTabs'

  withDefaults(defineProps<{ orientation?: 'horizontal' | 'vertical' }>(), {
    orientation: 'horizontal',
  })
  const emit = defineEmits<{ select: [FeedScope] }>()

  const { tabs, active, select } = useFeedTabs(key => emit('select', key))

  const indicatorId = useId()
</script>

<template>
  <Inline
    v-if="orientation === 'horizontal'"
    role="tablist"
    gap="none"
    align="end"
    :wrap="false"
    class="sticky top-(--app-header-height) z-30 h-(--feed-tabs-height) gap-8 bg-surface/72 backdrop-blur-xl backdrop-saturate-200 dark:bg-surface/68"
  >
    <motion.button
      v-for="tab in tabs"
      :key="tab.key"
      type="button"
      role="tab"
      :aria-selected="active === tab.key"
      class="group relative flex hn-interactive flex-col items-center gap-2 rounded"
      :while-press="{ opacity: 0.7 }"
      @click="select(tab.key)"
    >
      <Text
        as="span"
        size="sm"
        :class="
          cn(
            'transition-colors duration-150',
            active === tab.key ? 'font-bold text-fg' : 'font-medium text-muted group-hover:text-fg',
          )
        "
      >
        {{ tab.label }}
      </Text>
      <Stack gap="none" as="span" class="relative h-0.5 w-6">
        <Highlight
          v-if="active === tab.key"
          :id="indicatorId"
          axis="x"
          class="absolute inset-0 rounded-full bg-accent"
        />
      </Stack>
    </motion.button>
  </Inline>

  <Stack v-else role="tablist" aria-orientation="vertical" gap="xs">
    <motion.button
      v-for="tab in tabs"
      :key="tab.key"
      type="button"
      role="tab"
      :aria-selected="active === tab.key"
      :class="
        cn(
          'group hn-state-layer relative flex hn-interactive items-center gap-3 hn-press-none',
          'rounded-lg py-2.5 ps-4 pe-3 transition-colors duration-150',
          '[--hn-state-selected-opacity:0]',
          active === tab.key ? 'text-fg' : 'text-muted',
        )
      "
      :while-press="{ opacity: 0.7 }"
      @click="select(tab.key)"
    >
      <Highlight
        v-if="active === tab.key"
        :id="indicatorId"
        axis="y"
        class="absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-full bg-accent"
      />
      <component :is="tab.icon" class="size-4 shrink-0" aria-hidden="true" />
      <Text as="span" size="sm" :class="active === tab.key ? 'font-bold' : 'font-medium'">
        {{ tab.label }}
      </Text>
    </motion.button>
  </Stack>
</template>
