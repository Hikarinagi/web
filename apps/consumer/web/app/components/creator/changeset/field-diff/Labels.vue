<script setup lang="ts">
  const props = defineProps<{
    op: Record<string, unknown>
  }>()

  interface Row {
    key: string
    value: string
  }

  function normalize(input: unknown): Row[] {
    if (!Array.isArray(input)) return []
    return input.map(item => {
      const row = item as Record<string, unknown>
      return {
        key: typeof row?.key === 'string' ? row.key : '',
        value: typeof row?.value === 'string' ? row.value : '',
      }
    })
  }

  const diff = computed(() => {
    const from = normalize(props.op.from)
    const to = normalize(props.op.to)
    const prev = new Map<string, Row>()
    for (const r of from) if (r.key) prev.set(r.key, r)
    const toKeys = new Set(to.map(r => r.key).filter(Boolean))
    const matched = to.map(r => {
      const old = r.key ? prev.get(r.key) : undefined
      if (!old) return { kind: 'added' as const, row: r, old: undefined }
      return {
        kind: old.value !== r.value ? ('modified' as const) : ('kept' as const),
        row: r,
        old,
      }
    })
    const removed = from
      .filter(r => !r.key || !toKeys.has(r.key))
      .map(r => ({ kind: 'removed' as const, row: r, old: undefined }))
    const fromCommon = from.map(r => r.key).filter(k => k && toKeys.has(k))
    const toCommon = to.map(r => r.key).filter(k => k && prev.has(k))
    const reordered = fromCommon.some((k, i) => k !== toCommon[i])
    return { rows: [...matched, ...removed], reordered }
  })
</script>

<template>
  <p v-if="diff.reordered" class="mb-2 text-xs text-muted-color">顺序已调整</p>
  <ul class="flex flex-col gap-1">
    <li
      v-for="(d, i) in diff.rows"
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
        class="w-28 shrink-0 truncate text-sm"
        :class="
          d.kind === 'removed' ? 'text-red-700 line-through dark:text-red-300' : 'font-medium'
        "
      >
        {{ d.row.key || '（未命名）' }}
      </span>
      <span class="min-w-0 flex-1 text-sm">
        <template v-if="d.kind === 'modified'">
          <span class="text-muted-color line-through">{{ d.old?.value }}</span>
          <span class="mx-1.5 text-muted-color">→</span>
          <span class="text-surface-700 dark:text-surface-300">{{ d.row.value }}</span>
        </template>
        <span
          v-else
          class="wrap-anywhere"
          :class="
            d.kind === 'removed'
              ? 'text-red-700 line-through dark:text-red-300'
              : 'text-surface-700 dark:text-surface-300'
          "
        >
          {{ d.row.value }}
        </span>
      </span>
    </li>
  </ul>
</template>
