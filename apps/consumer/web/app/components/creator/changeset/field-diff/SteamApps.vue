<script setup lang="ts">
  import { Inline, Link, Text } from '@hina-ui/vue'

  const props = defineProps<{
    op: Record<string, unknown>
  }>()

  const TONE = {
    added: 'bg-success-soft text-success-text',
    removed: 'bg-danger-soft text-danger-text line-through',
  } as const

  const MARKER = { added: '+', removed: '−' } as const

  function normalize(input: unknown): number[] {
    if (!Array.isArray(input)) return []
    return input
      .map(item => (item as Record<string, unknown>)?.app_id)
      .filter((id): id is number => typeof id === 'number')
  }

  const rows = computed(() => {
    const from = normalize(props.op.from)
    const to = normalize(props.op.to)
    const fromSet = new Set(from)
    const toSet = new Set(to)

    return [
      ...to.map(id => ({ id, kind: fromSet.has(id) ? ('kept' as const) : ('added' as const) })),
      ...from.filter(id => !toSet.has(id)).map(id => ({ id, kind: 'removed' as const })),
    ]
  })
</script>

<template>
  <Inline as="ul" gap="sm">
    <Inline
      v-for="row in rows"
      :key="`${row.kind}-${row.id}`"
      as="li"
      gap="xs"
      align="center"
      :wrap="false"
      class="rounded-md px-2 py-1 text-sm"
      :class="TONE[row.kind as keyof typeof TONE] ?? 'text-fg'"
    >
      <Text as="span" weight="semibold" class="text-inherit">
        {{ MARKER[row.kind as keyof typeof MARKER] ?? '·' }}
      </Text>
      <Link
        :href="`https://store.steampowered.com/app/${row.id}/`"
        target="_blank"
        rel="noopener noreferrer"
        class="text-inherit"
      >
        {{ row.id }}
      </Link>
    </Inline>
  </Inline>
</template>
