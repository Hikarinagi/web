<script setup lang="ts">
  import { AnimatePresence, motion } from 'motion-v'
  import { Plus, X } from '@lucide/vue'
  import { TRANSITION } from '~/lib/motion'
  import { POST_MAX_COVERS } from './composables/useComposer'
  import type { MediaValue } from '~/components/media-library/types'

  defineOptions({ name: 'FeedComposerCovers' })

  defineProps<{ show: boolean; covers: MediaValue[]; coversFull: boolean }>()
  defineEmits<{ add: []; remove: [id: number] }>()
</script>

<template>
  <AnimatePresence>
    <motion.div
      v-if="show"
      key="covers"
      :initial="{ height: 0, opacity: 0 }"
      :animate="{ height: 'auto', opacity: 1 }"
      :exit="{ height: 0, opacity: 0 }"
      :transition="TRANSITION"
      class="overflow-hidden"
    >
      <div class="grid grid-cols-[repeat(auto-fill,minmax(92px,1fr))] gap-2 py-2 pr-4 pl-16">
        <div
          v-for="m in covers"
          :key="m.id"
          class="group/cover relative aspect-square overflow-hidden rounded-lg border border-surface-200 dark:border-surface-700"
        >
          <HikariImage
            :src="m.src"
            alt=""
            preset="small"
            class="size-full"
            image-class="size-full object-cover"
            :lazy="false"
            preview
          >
            <template #empty><span /></template>
            <template #error><span /></template>
          </HikariImage>
          <div class="absolute top-1 right-1">
            <Button
              unstyled
              aria-label="移除图片"
              class="flex size-5 cursor-pointer items-center justify-center rounded-md bg-surface-900/55 text-white opacity-100 transition-opacity md:opacity-0 md:group-hover/cover:opacity-100 md:focus-visible:opacity-100"
              @click.stop="$emit('remove', m.id)"
            >
              <template #icon><X :size="12" /></template>
            </Button>
          </div>
        </div>
        <button
          v-if="!coversFull"
          type="button"
          aria-label="添加图片"
          class="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-surface-300 text-muted-color transition-colors hover:border-primary-400 hover:text-primary-500 dark:border-surface-600"
          @click.stop="$emit('add')"
        >
          <Plus :size="20" />
          <span class="text-[11px] font-medium tabular-nums">
            {{ covers.length }}/{{ POST_MAX_COVERS }}
          </span>
        </button>
      </div>
    </motion.div>
  </AnimatePresence>
</template>
