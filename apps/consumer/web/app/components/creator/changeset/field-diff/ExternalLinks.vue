<script setup lang="ts">
  import { Inline, Stack, Text } from '@hina-ui/vue'
  import type { BackendGalgameExternalLinkRow } from '~/features/creator/editor'

  const ROW_TONE = { added: 'bg-success-soft', removed: 'bg-danger-soft' } as const
  const MARK_TONE = { added: 'text-success-text', removed: 'text-danger-text' } as const
  const MARKER = { added: '+', removed: '−' } as const

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
        class="w-36 shrink-0"
        :class="d.kind === 'removed' ? 'text-danger-text line-through' : 'font-medium'"
      >
        {{ d.row.label || d.row.name }}
      </Text>
      <Text as="span" size="sm" tone="muted" truncate class="min-w-0 flex-1">
        {{ d.row.url }}
      </Text>
    </Inline>
  </Stack>
</template>
