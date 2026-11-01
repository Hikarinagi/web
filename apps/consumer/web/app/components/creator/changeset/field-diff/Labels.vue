<script setup lang="ts">
  import { Inline, Stack, Text } from '@hina-ui/vue'

  const props = defineProps<{
    op: Record<string, unknown>
  }>()

  const ROW_TONE = { added: 'bg-success-soft', removed: 'bg-danger-soft' } as const
  const MARK_TONE = { added: 'text-success-text', removed: 'text-danger-text' } as const
  const MARKER = { added: '+', removed: '−' } as const

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
  <Text v-if="diff.reordered" size="xs" tone="muted" class="mb-2">顺序已调整</Text>
  <Stack as="ul" gap="xs">
    <Inline
      v-for="(d, i) in diff.rows"
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
        class="w-28 shrink-0"
        :class="d.kind === 'removed' ? 'text-danger-text line-through' : 'font-medium'"
      >
        {{ d.row.key || '（未命名）' }}
      </Text>
      <Text as="span" size="sm" class="min-w-0 flex-1">
        <template v-if="d.kind === 'modified'">
          <Text as="span" size="sm" tone="muted" class="line-through">{{ d.old?.value }}</Text>
          <Text as="span" size="sm" tone="muted" class="mx-1.5">→</Text>
          <Text as="span" size="sm">{{ d.row.value }}</Text>
        </template>
        <Text
          v-else
          as="span"
          size="sm"
          class="wrap-anywhere"
          :class="d.kind === 'removed' ? 'text-danger-text line-through' : ''"
        >
          {{ d.row.value }}
        </Text>
      </Text>
    </Inline>
  </Stack>
</template>
