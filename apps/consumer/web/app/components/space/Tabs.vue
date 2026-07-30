<script setup lang="ts">
  import { motion } from 'motion-v'
  import { SPACE_TABS, type SpaceTabKey } from '~/features/space/space'
  import { TRANSITION } from '~/lib/motion'

  defineOptions({ name: 'SpaceTabs' })

  const active = defineModel<SpaceTabKey>({ required: true })
  const props = defineProps<{ isSelf?: boolean }>()

  const visibleTabs = computed(() =>
    SPACE_TABS.filter(tab => {
      if ('selfOnly' in tab && tab.selfOnly) return props.isSelf
      if ('selfHidden' in tab && tab.selfHidden) return !props.isSelf
      return true
    }),
  )
</script>

<template>
  <div class="border-b border-surface-200 dark:border-surface-800">
    <ScrollArea visibility="hidden" axis="x" shadow="both" wheel-to-horizontal>
      <div role="tablist" class="flex min-w-max items-center gap-7">
        <motion.button
          v-for="tab in visibleTabs"
          :key="tab.key"
          type="button"
          role="tab"
          :aria-selected="active === tab.key"
          class="group relative flex cursor-pointer flex-col items-center gap-2 rounded pt-1 outline-none focus-visible:ring-2 focus-visible:ring-primary-200 dark:focus-visible:ring-primary-900"
          :while-press="{ opacity: 0.7 }"
          @click="active = tab.key"
        >
          <span
            class="text-[15px] transition-colors duration-150"
            :class="
              active === tab.key
                ? 'font-bold text-color'
                : 'font-medium text-muted-color group-hover:text-color'
            "
          >
            {{ tab.label }}
          </span>
          <span class="relative h-0.5 w-7">
            <motion.span
              v-if="active === tab.key"
              layout-id="space-tab-indicator"
              class="absolute inset-0 rounded-full bg-primary"
              :transition="TRANSITION"
            />
          </span>
        </motion.button>
      </div>
    </ScrollArea>
  </div>
</template>
