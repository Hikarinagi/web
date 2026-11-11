<script setup lang="ts">
  import { IconButton, Inline, Slider, Stack, Text } from '@hina-ui/vue'
  import { RotateCcw } from '@lucide/vue'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'LightNovelReaderSettingsRange' })

  const props = defineProps<{
    label: string
    value: number
    min: number
    max: number
    step: number
    digits?: number
    defaultValue?: number
  }>()
  const emit = defineEmits<{ change: [value: number] }>()

  const draft = ref(props.value)
  const resting = computed(() =>
    props.defaultValue === undefined ? undefined : Math.min(props.defaultValue, props.max),
  )

  function restore() {
    if (props.defaultValue !== undefined) emit('change', props.defaultValue)
  }

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
    <Inline justify="between" align="center" :wrap="false">
      <Text size="sm" tone="muted">{{ label }}</Text>
      <Inline align="center" gap="xs" :wrap="false">
        <IconButton
          v-if="resting !== undefined"
          label="恢复默认"
          variant="ghost"
          tone="neutral"
          size="xs"
          :class="cn(draft === resting && 'invisible')"
          @click="restore"
        >
          <RotateCcw aria-hidden="true" />
        </IconButton>
        <Text size="sm" weight="medium" class="tabular-nums">{{ draft.toFixed(digits ?? 0) }}</Text>
      </Inline>
    </Inline>
    <Slider v-model="draft" :min="min" :max="max" :step="step" :aria-label="label" label="none" />
  </Stack>
</template>
