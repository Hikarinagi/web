<script setup lang="ts">
  import { Check, Copy } from '@lucide/vue'

  defineOptions({ name: 'MermaidDiagramSourcePanel' })
  const props = defineProps<{ source: string }>()

  const { copy, copied } = useClipboard({ source: () => props.source })
</script>

<template>
  <div
    class="relative overflow-hidden rounded-2xl border border-surface bg-surface-100 dark:bg-surface-950"
  >
    <div class="absolute top-3 right-3 z-10">
      <Button
        unstyled
        class="inline-flex items-center justify-center rounded-md p-2 text-surface-500 transition-colors hover:bg-surface-200 hover:text-surface-700 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-200"
        :aria-label="copied ? '已复制' : '复制源码'"
        @click="copy()"
      >
        <Check v-if="copied" class="size-4 text-hikari-primary-600 dark:text-hikari-primary-400" />
        <Copy v-else class="size-4" />
      </Button>
    </div>
    <ScrollArea axis="both" class="h-full">
      <pre
        class="px-4 py-3.5 font-mono text-xs leading-6 text-surface-800 sm:text-sm dark:text-surface-100"
        >{{ source.trim() }}</pre
      >
    </ScrollArea>
  </div>
</template>
