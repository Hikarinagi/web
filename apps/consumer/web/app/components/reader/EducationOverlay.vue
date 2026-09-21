<script setup lang="ts">
  import { Button, Center, Stack, Text } from '@hina-ui/vue'
  import type { Component } from 'vue'
  import { cn } from '~/utils/cn'

  /**
   * Where a hint card sits once there is room to lay them out around the
   * reading surface. Below `sm` every card stacks in source order instead.
   */
  export type ReaderEducationPlacement = 'left' | 'right' | 'top' | 'center'

  export interface ReaderEducationHint {
    key: string
    placement: ReaderEducationPlacement
    title: string
    description?: string
    icon?: Component
  }

  defineOptions({ name: 'ReaderEducationOverlay' })

  withDefaults(
    defineProps<{
      hints: readonly ReaderEducationHint[]
      confirmLabel?: string
    }>(),
    { confirmLabel: '知道了，开始阅读' },
  )

  const emit = defineEmits<{ dismiss: [] }>()

  const PLACEMENT_CLASS: Record<ReaderEducationPlacement, string> = {
    left: 'sm:absolute sm:top-1/2 sm:left-[8%] sm:-translate-y-1/2',
    right: 'sm:absolute sm:top-1/2 sm:right-[8%] sm:-translate-y-1/2',
    top: 'sm:absolute sm:top-[14%] sm:left-1/2 sm:w-72 sm:-translate-x-1/2',
    center: 'sm:absolute sm:top-[38%] sm:left-1/2 sm:w-72 sm:-translate-x-1/2 sm:-translate-y-1/2',
  }
</script>

<template>
  <Stack gap="none" class="absolute inset-0 z-50 overflow-y-auto bg-black/72">
    <Stack
      gap="md"
      align="center"
      justify="center"
      class="min-h-full px-6 py-10 sm:relative sm:block sm:h-full sm:min-h-0 sm:p-0"
    >
      <Stack
        v-for="hint in hints"
        :key="hint.key"
        gap="xs"
        align="center"
        :class="
          cn(
            'w-60 rounded-xl border border-white/10 bg-hikari-reader-overlay/92 px-6 py-5 text-center',
            PLACEMENT_CLASS[hint.placement],
          )
        "
      >
        <component :is="hint.icon" v-if="hint.icon" :size="22" class="text-accent" aria-hidden />
        <Text as="p" size="sm" weight="semibold" class="text-white">{{ hint.title }}</Text>
        <Text v-if="hint.description" as="p" size="xs" class="text-hikari-reader-overlay-muted">
          {{ hint.description }}
        </Text>
      </Stack>

      <Center class="sm:absolute sm:bottom-[16%] sm:left-1/2 sm:-translate-x-1/2">
        <Button pill @click="emit('dismiss')">{{ confirmLabel }}</Button>
      </Center>
    </Stack>
  </Stack>
</template>
