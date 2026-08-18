<script setup lang="ts">
  const props = defineProps<{
    op: Record<string, unknown>
  }>()

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
  <ul class="flex flex-wrap gap-2">
    <li
      v-for="row in rows"
      :key="`${row.kind}-${row.id}`"
      class="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm"
      :class="
        row.kind === 'added'
          ? 'bg-green-500/10 text-green-700 dark:text-green-300'
          : row.kind === 'removed'
            ? 'bg-red-500/10 text-red-700 line-through dark:text-red-300'
            : 'text-surface-700 dark:text-surface-300'
      "
    >
      <span class="font-semibold">
        {{ row.kind === 'added' ? '+' : row.kind === 'removed' ? '−' : '·' }}
      </span>
      <a
        :href="`https://store.steampowered.com/app/${row.id}/`"
        target="_blank"
        rel="noopener noreferrer"
        class="underline-offset-2 hover:underline"
      >
        {{ row.id }}
      </a>
    </li>
  </ul>
</template>
