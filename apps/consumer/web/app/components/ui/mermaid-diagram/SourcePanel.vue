<script setup lang="ts">
  import { CopyButton, ScrollArea } from '@hina-ui/vue'

  defineOptions({ name: 'MermaidDiagramSourcePanel' })
  const props = defineProps<{ source: string }>()
</script>

<template>
  <div class="relative overflow-hidden rounded-2xl border border-line bg-inset">
    <CopyButton :text="props.source" class="absolute top-3 right-3 z-10" />
    <ScrollArea direction="both" class="h-full">
      <pre class="px-4 py-3.5 font-mono text-xs leading-6 text-fg sm:text-sm">{{
        source.trim()
      }}</pre>
    </ScrollArea>
  </div>
</template>
