<script setup lang="ts">
  import { Inline, Slider, Stack, Text } from '@hina-ui/vue'

  defineOptions({ name: 'LightNovelReaderSettingsRange' })

  const props = defineProps<{
    label: string
    value: number
    min: number
    max: number
    step: number
    digits?: number
  }>()
  const emit = defineEmits<{ change: [value: number] }>()

  const draft = ref(props.value)
  watch(
    () => props.value,
    value => (draft.value = value),
  )
  watchDebounced(
    draft,
    value => {
      const rounded = Number(value.toFixed(props.digits ?? 0))
      if (rounded !== props.value) emit('change', rounded)
    },
    { debounce: 150 },
  )
</script>

<template>
  <Stack gap="xs">
    <Inline justify="between" align="baseline" :wrap="false">
      <Text size="sm" tone="muted">{{ label }}</Text>
      <Text size="sm" weight="medium" class="tabular-nums">{{ draft.toFixed(digits ?? 0) }}</Text>
    </Inline>
    <Slider v-model="draft" :min="min" :max="max" :step="step" :aria-label="label" label="none" />
  </Stack>
</template>
