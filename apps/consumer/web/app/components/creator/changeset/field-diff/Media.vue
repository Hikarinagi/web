<script setup lang="ts">
  import { ArrowRight } from '@lucide/vue'
  import { mediaSrc } from './helpers'

  const props = defineProps<{
    op: Record<string, unknown>
  }>()

  const from = computed(() => mediaSrc(props.op.from))
  const to = computed(() => mediaSrc(props.op.to))
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <div
      class="flex size-24 items-center justify-center overflow-hidden rounded-lg border border-red-500/30 bg-red-500/10"
    >
      <HikariImage
        v-if="from"
        :src="from"
        alt=""
        preset="small"
        class="size-full"
        image-class="size-full object-cover"
      />
      <span v-else class="text-xs text-muted-color">（空）</span>
    </div>
    <ArrowRight :size="14" class="shrink-0 text-muted-color" aria-hidden="true" />
    <div
      class="flex size-24 items-center justify-center overflow-hidden rounded-lg border border-green-500/30 bg-green-500/10"
    >
      <HikariImage
        v-if="to"
        :src="to"
        alt=""
        preset="small"
        class="size-full"
        image-class="size-full object-cover"
      />
      <span v-else class="text-xs text-muted-color">（空）</span>
    </div>
  </div>
</template>
