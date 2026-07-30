<script setup lang="ts">
  import type { BackendGalgamePriceRow } from '~/features/creator/editor'

  const props = defineProps<{
    op: Record<string, unknown>
  }>()

  const taxLabel = (v: boolean | null | undefined) =>
    v === true ? '含税' : v === false ? '不含税' : null

  const diff = computed(() => {
    const from = (Array.isArray(props.op.from) ? props.op.from : []) as BackendGalgamePriceRow[]
    const to = (Array.isArray(props.op.to) ? props.op.to : []) as BackendGalgamePriceRow[]
    const prev = new Map<string, BackendGalgamePriceRow>()
    for (const r of from) if (r.version) prev.set(r.version, r)
    const toVersions = new Set(to.map(r => r.version).filter(Boolean))
    const matched = to.map(r => {
      const old = r.version ? prev.get(r.version) : undefined
      if (!old) return { kind: 'added' as const, row: r, old: undefined }
      const changed =
        old.amount !== r.amount ||
        old.currency !== r.currency ||
        old.tax_included !== r.tax_included
      return { kind: changed ? ('modified' as const) : ('kept' as const), row: r, old }
    })
    const removed = from
      .filter(r => !r.version || !toVersions.has(r.version))
      .map(r => ({ kind: 'removed' as const, row: r, old: undefined }))
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
        class="w-44 shrink-0 truncate text-sm"
        :class="
          d.kind === 'removed' ? 'text-red-700 line-through dark:text-red-300' : 'font-medium'
        "
      >
        {{ d.row.version || '（无版本名）' }}
      </span>
      <CreatorChangesetFieldDiffPricesCell
        class="flex-1 justify-end"
        :kind="d.kind"
        :value="d.row.amount ?? null"
        :old-value="d.old?.amount ?? null"
      />
      <CreatorChangesetFieldDiffPricesCell
        class="w-20"
        :kind="d.kind"
        :value="d.row.currency ?? null"
        :old-value="d.old?.currency ?? null"
      />
      <CreatorChangesetFieldDiffPricesCell
        class="w-16"
        :kind="d.kind"
        :value="taxLabel(d.row.tax_included)"
        :old-value="taxLabel(d.old?.tax_included)"
      />
    </li>
  </ul>
</template>
