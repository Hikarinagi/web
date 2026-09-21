<script setup lang="ts">
  import { Button, FormField, Inline, Input, Slider, Stack, Text } from '@hina-ui/vue'

  const props = defineProps<{
    initialAlt: string | null
    initialCaption: string | null
    initialWidthPercent: number
    onChange: (patch: {
      alt?: string | null
      caption?: string | null
      width_percent?: number
    }) => void
  }>()

  const MIN_PERCENT = 20
  const MAX_PERCENT = 100
  const SNAP_POINTS = [25, 33, 50, 66, 75, 100]

  const alt = ref(props.initialAlt ?? '')
  const caption = ref(props.initialCaption ?? '')
  const widthPercent = ref(props.initialWidthPercent)

  watchDebounced(alt, value => props.onChange({ alt: value || null }), { debounce: 200 })
  watchDebounced(caption, value => props.onChange({ caption: value || null }), { debounce: 200 })
  watch(widthPercent, value => props.onChange({ width_percent: value }))

  function snapTo(value: number) {
    widthPercent.value = value
  }
</script>

<template>
  <Stack gap="sm" class="w-full sm:w-90">
    <FormField name="alt" label="alt（可访问性描述）">
      <Input v-model="alt" autofocus size="sm" placeholder="为屏幕阅读器添加描述" />
    </FormField>

    <FormField name="caption" label="图注">
      <Input v-model="caption" size="sm" placeholder="图片说明" />
    </FormField>

    <Stack gap="xs">
      <Inline gap="sm" align="center" justify="between">
        <Text as="span" size="sm" weight="medium" tone="muted">宽度</Text>
        <Text as="span" size="sm" class="tabular-nums">{{ Math.round(widthPercent) }}%</Text>
      </Inline>
      <Slider v-model="widthPercent" :min="MIN_PERCENT" :max="MAX_PERCENT" :step="1" />
      <Inline gap="xs" justify="between">
        <Button
          v-for="point in SNAP_POINTS"
          :key="point"
          size="sm"
          variant="ghost"
          :tone="Math.round(widthPercent) === point ? 'accent' : 'neutral'"
          @click="snapTo(point)"
        >
          {{ point }}%
        </Button>
      </Inline>
    </Stack>
  </Stack>
</template>
