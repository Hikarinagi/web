<script setup lang="ts">
  import { Inline, Stack, Text } from '@hina-ui/vue'
  import type { BackendGalgamePriceRow } from '~/features/creator/editor'

  const ROW_TONE = { added: 'bg-success-soft', removed: 'bg-danger-soft' } as const
  const MARK_TONE = { added: 'text-success-text', removed: 'text-danger-text' } as const
  const MARKER = { added: '+', removed: '−' } as const

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
  <Stack as="ul" gap="xs">
    <Inline
      v-for="(d, i) in diff"
      :key="i"
      as="li"
      gap="sm"
      align="center"
      :wrap="false"
      class="rounded-md px-2 py-1.5"
      :class="ROW_TONE[d.kind as keyof typeof ROW_TONE]"
    >
      <Text
        as="span"
        weight="semibold"
        class="w-4 shrink-0 text-center"
        :class="MARK_TONE[d.kind as keyof typeof MARK_TONE] ?? 'text-muted'"
      >
        {{ MARKER[d.kind as keyof typeof MARKER] ?? '·' }}
      </Text>
      <Text
        as="span"
        size="sm"
        truncate
        class="w-44 shrink-0"
        :class="d.kind === 'removed' ? 'text-danger-text line-through' : 'font-medium'"
      >
        {{ d.row.version || '（无版本名）' }}
      </Text>
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
    </Inline>
  </Stack>
</template>
