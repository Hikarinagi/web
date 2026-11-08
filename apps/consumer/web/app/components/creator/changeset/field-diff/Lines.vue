<script setup lang="ts">
  import { Card, Inline, Text } from '@hina-ui/vue'
  import { diffLines } from '~/features/creator/changeset/diff'

  const props = defineProps<{
    op: Record<string, unknown>
  }>()

  const lines = computed(() => diffLines(String(props.op.from ?? ''), String(props.op.to ?? '')))

  const TONE = {
    add: 'bg-success-soft text-success-text',
    remove: 'bg-danger-soft text-danger-text',
  } as const

  const MARKER = { add: '+', remove: '−' } as const
</script>

<template>
  <Card :padded="false" class="shadow-none">
    <Inline
      v-for="(line, index) in lines"
      :key="index"
      gap="sm"
      :wrap="false"
      class="px-3 py-0.5"
      :class="TONE[line.type as keyof typeof TONE]"
    >
      <Text as="span" class="w-3 shrink-0 text-center text-inherit opacity-60 select-none">
        {{ MARKER[line.type as keyof typeof MARKER] ?? '' }}
      </Text>
      <Text as="span" class="wrap-break-word whitespace-pre-wrap text-inherit">
        {{ line.text || ' ' }}
      </Text>
    </Inline>
  </Card>
</template>
