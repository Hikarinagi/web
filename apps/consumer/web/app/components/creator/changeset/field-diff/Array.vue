<script setup lang="ts">
  import { Inline, Stack, Text } from '@hina-ui/vue'

  const props = defineProps<{
    op: Record<string, unknown>
  }>()

  const diff = computed(() => {
    const a = Array.isArray(props.op.from) ? props.op.from.map(String) : []
    const b = Array.isArray(props.op.to) ? props.op.to.map(String) : []
    return {
      kept: a.filter(item => b.includes(item)),
      removed: a.filter(item => !b.includes(item)),
      added: b.filter(item => !a.includes(item)),
    }
  })

  const ROWS = [
    { key: 'removed', marker: '−', tone: 'text-danger-text', strike: true },
    { key: 'added', marker: '+', tone: 'text-success-text', strike: false },
    { key: 'kept', marker: '·', tone: 'text-muted', strike: false },
  ] as const
</script>

<template>
  <Stack as="ul" gap="xs">
    <template v-for="row in ROWS" :key="row.key">
      <Inline
        v-for="item in diff[row.key]"
        :key="`${row.key}-${item}`"
        as="li"
        gap="xs"
        align="center"
        :wrap="false"
        :class="row.tone"
      >
        <Text as="span" class="shrink-0 text-inherit opacity-60 select-none">{{ row.marker }}</Text>
        <Text as="span" class="text-inherit" :class="row.strike ? 'line-through' : ''">
          {{ item }}
        </Text>
      </Inline>
    </template>
  </Stack>
</template>
