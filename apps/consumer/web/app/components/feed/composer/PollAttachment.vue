<script setup lang="ts">
  import { Pencil, Vote, X } from '@lucide/vue'
  import type { PollNodeAttrs } from '@hikarinagi/editor-schema'

  defineOptions({ name: 'FeedComposerPollAttachment' })

  defineProps<{ poll: PollNodeAttrs }>()
  const emit = defineEmits<{ edit: []; remove: [] }>()
</script>

<template>
  <div class="px-4 pt-1 pb-2 pl-16">
    <div class="flex items-center gap-2 rounded-lg bg-surface-100 px-3 py-1.5 dark:bg-surface-800">
      <Vote class="size-4 shrink-0 text-muted-color" />
      <span class="min-w-0 flex-1 truncate text-sm text-color">
        {{ poll.question }}
        <span class="text-muted-color">· {{ poll.options.length }} 个选项</span>
      </span>
      <Button
        v-tooltip.top="'编辑投票'"
        unstyled
        type="button"
        aria-label="编辑投票"
        class="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-muted-color transition-colors hover:bg-surface-200 hover:text-color dark:hover:bg-surface-700"
        @click="emit('edit')"
      >
        <Pencil class="size-3.5" />
      </Button>
      <Button
        v-tooltip.top="'移除投票'"
        unstyled
        type="button"
        aria-label="移除投票"
        class="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-muted-color transition-colors hover:bg-surface-200 hover:text-hikari-red-500 dark:hover:bg-surface-700"
        @click="emit('remove')"
      >
        <X class="size-4" />
      </Button>
    </div>
  </div>
</template>
