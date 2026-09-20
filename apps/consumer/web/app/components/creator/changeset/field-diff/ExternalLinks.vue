<script setup lang="ts">
  import type { BackendGalgameExternalLinkRow } from '~/features/creator/editor'

  const props = defineProps<{
    op: Record<string, unknown>
  }>()

  const diff = computed(() => {
    const from = (
      Array.isArray(props.op.from) ? props.op.from : []
    ) as BackendGalgameExternalLinkRow[]
    const to = (Array.isArray(props.op.to) ? props.op.to : []) as BackendGalgameExternalLinkRow[]
    const prev = new Map<string, BackendGalgameExternalLinkRow>()
    for (const r of from) if (r.url) prev.set(r.url, r)
    const toUrls = new Set(to.map(r => r.url).filter(Boolean))
    const matched = to.map(r => {
      const old = r.url ? prev.get(r.url) : undefined
      if (!old) return { kind: 'added' as const, row: r }
      const changed = old.name !== r.name || old.label !== r.label
      return { kind: changed ? ('modified' as const) : ('kept' as const), row: r }
    })
    const removed = from
      .filter(r => !r.url || !toUrls.has(r.url))
      .map(r => ({ kind: 'removed' as const, row: r }))
    return [...matched, ...removed]
  })
</script>

<template>
  <ul class="flex flex-col gap-1">
    <li
      v-for="(d, i) in diff"
      :key="i"
      class="flex items-center gap-3 rounded-md px-2 py-1.5"
      :class="d.kind === 'added' ? 'bg-green-500/10' : d.kind === 'removed' ? 'bg-red-500/10' : ''"
    >
      <span
        class="w-4 shrink-0 text-center font-semibold"
        :class="
          d.kind === 'added'
            ? 'text-green-700 dark:text-green-300'
            : d.kind === 'removed'
              ? 'text-red-700 dark:text-red-300'
              : 'text-muted-color'
        "
      >
        {{ d.kind === 'added' ? '+' : d.kind === 'removed' ? '−' : '·' }}
      </span>
      <span
        class="w-36 shrink-0 truncate text-sm"
        :class="
          d.kind === 'removed' ? 'text-red-700 line-through dark:text-red-300' : 'font-medium'
        "
      >
        {{ d.row.label || d.row.name }}
      </span>
      <span class="min-w-0 flex-1 truncate text-sm text-muted-color">{{ d.row.url }}</span>
    </li>
  </ul>
</template>
