<script setup lang="ts">
  import { Indicator, Inline, Text } from '@hina-ui/vue'

  const props = defineProps<{
    check: { status: 'PENDING' | 'READY' | 'FAILED'; flagged: number | null } | null
  }>()

  const state = computed(() => {
    const check = props.check
    if (!check) return { tone: 'neutral' as const, label: '未检查', pulse: false }
    if (check.status === 'PENDING')
      return { tone: 'neutral' as const, label: '检查中', pulse: true }
    if (check.status === 'FAILED')
      return { tone: 'danger' as const, label: '检查失败', pulse: false }
    return check.flagged
      ? { tone: 'warning' as const, label: `${check.flagged} 页有标记`, pulse: false }
      : { tone: 'success' as const, label: '无标记', pulse: false }
  })
</script>

<template>
  <Inline gap="sm" align="center" :wrap="false">
    <Indicator :tone="state.tone" :pulse="state.pulse" size="sm" />
    <Text size="sm" tone="muted" class="whitespace-nowrap">{{ state.label }}</Text>
  </Inline>
</template>
