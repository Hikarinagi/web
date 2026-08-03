<script setup lang="ts">
  import { Check, Copy } from '@lucide/vue'

  defineOptions({ name: 'DeveloperCodeBlock' })
  const props = withDefaults(defineProps<{ code: string; html?: string; capped?: boolean }>(), {
    html: undefined,
    capped: false,
  })

  const { copy, copied } = useClipboard({ source: () => props.code })
</script>

<template>
  <div
    class="group relative overflow-hidden rounded-xl border border-surface bg-surface-100 dark:bg-surface-950"
  >
    <div class="absolute top-2 right-2 z-10">
      <Button
        v-tooltip.left="copied ? '已复制' : '复制'"
        unstyled
        class="inline-flex items-center justify-center rounded-md p-2 text-surface-500 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-surface-200 hover:text-surface-700 focus-visible:opacity-100 max-lg:opacity-100 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-200"
        :aria-label="copied ? '已复制' : '复制'"
        @click="copy()"
      >
        <Check v-if="copied" class="size-4 text-hikari-primary-600 dark:text-hikari-primary-400" />
        <Copy v-else class="size-4" />
      </Button>
    </div>
    <ScrollArea :axis="capped ? 'both' : 'x'" :class="capped ? 'max-h-80' : undefined">
      <div v-if="html" class="hikari-code" v-html="html" />
      <pre
        v-else
        class="px-4 py-3.5 font-mono text-xs leading-6 text-surface-800 sm:text-sm dark:text-surface-100"
        >{{ code }}</pre
      >
    </ScrollArea>
  </div>
</template>

<style scoped>
  .hikari-code :deep(pre.shiki) {
    margin: 0;
    padding: 0.875rem 1rem;
    background-color: transparent !important;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    line-height: 1.5rem;
  }

  @media (min-width: 640px) {
    .hikari-code :deep(pre.shiki) {
      font-size: 0.875rem;
    }
  }
</style>
