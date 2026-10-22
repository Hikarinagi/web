<script setup lang="ts">
  import { Inline, Stack, Text } from '@hina-ui/vue'
  import type { RowDiffSpec } from '~/features/creator/changeset/row-diff'

  type Row = Record<string, unknown>

  const ROW_TONE = { added: 'bg-success-soft', removed: 'bg-danger-soft' } as const
  const MARK_TONE = { added: 'text-success-text', removed: 'text-danger-text' } as const
  const MARKER = { added: '+', removed: '−' } as const

  const props = defineProps<{
    op: Record<string, unknown>
    spec: RowDiffSpec
  }>()

  const show = (row: Row | undefined, key: string) => {
    const column = props.spec.columns.find(item => item.key === key)
    const value = row?.[key]
    if (column?.format) return column.format(value)
    return typeof value === 'string' || typeof value === 'number' ? value : null
  }

  const diff = computed(() => {
    const name = (row: Row) =>
      typeof row[props.spec.name] === 'string' ? row[props.spec.name] : ''
    const from = (Array.isArray(props.op.from) ? props.op.from : []) as Row[]
    const to = (Array.isArray(props.op.to) ? props.op.to : []) as Row[]
    const prev = new Map(from.filter(row => name(row)).map(row => [name(row), row]))
    const kept = new Set(to.map(name).filter(Boolean))
    const matched = to.map(row => {
      const old = name(row) ? prev.get(name(row)) : undefined
      if (!old) return { kind: 'added' as const, row, old: undefined }
      const changed = props.spec.columns.some(
        column => show(old, column.key) !== show(row, column.key),
      )
      return { kind: changed ? ('modified' as const) : ('kept' as const), row, old }
    })
    const removed = from
      .filter(row => !name(row) || !kept.has(name(row)))
      .map(row => ({ kind: 'removed' as const, row, old: undefined }))
    return [...matched, ...removed].map(item => ({
      ...item,
      title: (item.row[props.spec.name] as string) || props.spec.empty,
      columns: props.spec.columns.filter(column =>
        item.kind === 'modified'
          ? show(item.old, column.key) !== show(item.row, column.key)
          : show(item.row, column.key) !== null,
      ),
    }))
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
        {{ d.title }}
      </Text>
      <CreatorChangesetFieldDiffRowsCell
        v-for="column in d.columns"
        :key="column.key"
        :kind="d.kind"
        :value="show(d.row, column.key)"
        :old-value="show(d.old, column.key)"
      />
    </Inline>
  </Stack>
</template>
