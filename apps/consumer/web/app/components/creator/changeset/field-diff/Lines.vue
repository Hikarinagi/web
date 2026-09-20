<script setup lang="ts">
  import { diffLines } from '~/features/creator/changeset/diff'

  const props = defineProps<{
    op: Record<string, unknown>
  }>()

  const lines = computed(() => diffLines(String(props.op.from ?? ''), String(props.op.to ?? '')))
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-surface-200 dark:border-surface-800">
    <div
      v-for="(line, index) in lines"
      :key="index"
      :class="[
        'flex gap-2 px-3 py-0.5',
        line.type === 'add' && 'bg-green-500/10 text-green-700 dark:text-green-300',
        line.type === 'remove' && 'bg-red-500/10 text-red-700 dark:text-red-300',
      ]"
    >
      <span class="w-3 shrink-0 text-center text-muted-color select-none">
        {{ line.type === 'add' ? '+' : line.type === 'remove' ? '−' : '' }}
      </span>
      <span class="wrap-break-word whitespace-pre-wrap">{{ line.text || ' ' }}</span>
    </div>
  </div>
</template>
