<script setup lang="ts">
  import { Inline, NumberInput, SegmentedControl, Stack, Switch, Text } from '@hina-ui/vue'
  import type { BackendMangaRegion } from '~/features/workbench/manga/manga'
  import type { TypesetStyle } from '~/features/workbench/manga/typeset'

  const props = defineProps<{
    region: BackendMangaRegion
    style: TypesetStyle
    editable: boolean
  }>()
  const emit = defineEmits<{ update: [style: Record<string, unknown>] }>()

  const DIRECTION_OPTIONS = [
    { value: 'vertical', label: '竖排' },
    { value: 'horizontal', label: '横排' },
  ]
  const FONT_OPTIONS = [
    { value: 'sans', label: '黑体' },
    { value: 'serif', label: '宋体' },
  ]
  const COLOR_OPTIONS = [
    { value: 'black', label: '黑字' },
    { value: 'white', label: '白字' },
  ]

  function set(patch: Partial<TypesetStyle>) {
    emit('update', { ...(props.region.style ?? {}), ...props.style, ...patch })
  }
</script>

<template>
  <Stack gap="sm">
    <Inline gap="sm" align="center">
      <SegmentedControl
        :model-value="style.vertical ? 'vertical' : 'horizontal'"
        :options="DIRECTION_OPTIONS"
        size="sm"
        :disabled="!editable"
        aria-label="排版方向"
        @update:model-value="value => set({ vertical: value === 'vertical' })"
      />
      <SegmentedControl
        :model-value="style.font"
        :options="FONT_OPTIONS"
        size="sm"
        :disabled="!editable"
        aria-label="字体"
        @update:model-value="value => set({ font: value as 'sans' | 'serif' })"
      />
      <SegmentedControl
        :model-value="style.color"
        :options="COLOR_OPTIONS"
        size="sm"
        :disabled="!editable"
        aria-label="文字颜色"
        @update:model-value="value => set({ color: value as 'black' | 'white' })"
      />
    </Inline>
    <Inline gap="sm" align="center">
      <Text size="sm" tone="muted">字号</Text>
      <NumberInput
        :model-value="style.size"
        :min="6"
        :max="400"
        size="sm"
        placeholder="自动"
        :disabled="!editable"
        aria-label="字号"
        class="w-28"
        @update:model-value="value => set({ size: typeof value === 'number' ? value : null })"
      />
      <Switch
        :model-value="style.stroke"
        :disabled="!editable"
        @update:model-value="value => set({ stroke: !!value })"
      >
        描边
      </Switch>
      <Switch
        :model-value="style.fill"
        :disabled="!editable"
        @update:model-value="value => set({ fill: !!value })"
      >
        白底
      </Switch>
    </Inline>
  </Stack>
</template>
