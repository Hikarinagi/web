<script setup lang="ts">
  import { ArrowRight } from '@lucide/vue'

  const props = defineProps<{
    op: Record<string, unknown>
  }>()

  const from = computed(() => props.op.from)
  const to = computed(() => props.op.to)
  const fromName = computed(() =>
    typeof props.op.from_name === 'string' ? props.op.from_name : '',
  )
  const fromCover = computed(() =>
    typeof props.op.from_cover === 'string' && props.op.from_cover ? props.op.from_cover : '',
  )
  const toName = computed(() => (typeof props.op.to_name === 'string' ? props.op.to_name : ''))
  const toCover = computed(() =>
    typeof props.op.to_cover === 'string' && props.op.to_cover ? props.op.to_cover : '',
  )
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <span
      v-if="from != null"
      class="inline-flex items-center gap-2 rounded-lg bg-red-500/10 px-2 py-1 text-red-700 dark:text-red-300"
    >
      <HikariImage
        v-if="fromCover"
        :src="fromCover"
        alt=""
        preset="small"
        class="size-7 shrink-0 overflow-hidden rounded"
        image-class="size-full object-cover"
      />
      <span class="text-sm font-medium line-through">{{ fromName || `#${from}` }}</span>
      <span class="font-mono text-xs line-through opacity-70">#{{ from }}</span>
    </span>
    <span
      v-else
      class="rounded bg-red-500/10 px-2 py-1 text-red-700 line-through dark:text-red-300"
    >
      （空）
    </span>
    <ArrowRight :size="14" class="shrink-0 text-muted-color" aria-hidden="true" />
    <span
      v-if="to != null"
      class="inline-flex items-center gap-2 rounded-lg bg-green-500/10 px-2 py-1 text-green-700 dark:text-green-300"
    >
      <HikariImage
        v-if="toCover"
        :src="toCover"
        alt=""
        preset="small"
        class="size-7 shrink-0 overflow-hidden rounded"
        image-class="size-full object-cover"
      />
      <span class="text-sm font-medium">{{ toName || `#${to}` }}</span>
      <span class="font-mono text-xs opacity-70">#{{ to }}</span>
    </span>
    <span v-else class="rounded bg-green-500/10 px-2 py-1 text-green-700 dark:text-green-300">
      （空）
    </span>
  </div>
</template>
