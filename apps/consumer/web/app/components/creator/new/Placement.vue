<script setup lang="ts">
  import { FormField, RadioGroup, SegmentedControl, Stack } from '@hina-ui/vue'
  import type { BackendEntryDraft, BackendEntryType } from '~/features/creator/entry/contract'

  defineOptions({ name: 'CreatorNewPlacement' })
  const props = defineProps<{ kind: 'book' | 'game'; selected: BackendEntryDraft['target'] }>()
  const emit = defineEmits<{ change: [] }>()
  const placement = defineModel<BackendEntryDraft['placement'] | null>('placement', {
    required: true,
  })
  const target = defineModel<number | null>('target', { required: true })
  const medium = defineModel<string | null>('medium', { required: true })

  const OPTIONS = {
    book: [
      { value: 'series', label: '系列的新一卷' },
      { value: 'volume', label: '现有卷的另一版本' },
      { value: 'new_series', label: '独立系列' },
    ],
    game: [
      { value: 'new_game', label: '新游戏' },
      { value: 'version', label: '现有游戏的版本' },
      { value: 'addon', label: '现有游戏的追加内容' },
    ],
  } as const
  const MEDIA = [
    { value: 'LIGHT_NOVEL', label: '轻小说' },
    { value: 'MANGA', label: '漫画' },
  ]
  const PICKERS: Record<string, { label: string; types: BackendEntryType[] }> = {
    series: { label: '系列', types: ['SERIES'] },
    volume: { label: '卷', types: ['VOLUME'] },
    version: { label: '游戏', types: ['GAME'] },
    addon: { label: '游戏', types: ['GAME'] },
  }
  const picker = computed(() => (placement.value ? PICKERS[placement.value] : undefined))
  const shown = computed(() =>
    props.selected && picker.value?.types.includes(props.selected.type) ? props.selected : null,
  )

  function choose(value: string) {
    const next = PICKERS[value]
    placement.value = value as BackendEntryDraft['placement']
    target.value =
      next && props.selected && next.types.includes(props.selected.type) ? props.selected.id : null
    if (next ? target.value !== null : value !== 'new_series' || medium.value) emit('change')
  }
</script>

<template>
  <Stack gap="md">
    <FormField name="placement" label="归属位置">
      <RadioGroup
        :model-value="placement ?? undefined"
        :options="[...OPTIONS[kind]]"
        @update:model-value="value => choose(String(value))"
      />
    </FormField>
    <FormField v-if="picker" name="target" :label="picker.label">
      <CreatorEntryFormTarget
        :model-value="target"
        :types="picker.types"
        :selected="shown"
        @update:model-value="
          value => {
            target = value
            if (value) emit('change')
          }
        "
      />
    </FormField>
    <FormField v-if="placement === 'new_series'" name="medium" label="类别">
      <SegmentedControl
        :model-value="medium ?? undefined"
        :options="MEDIA"
        size="sm"
        class="self-start"
        @update:model-value="
          value => {
            medium = String(value)
            emit('change')
          }
        "
      />
    </FormField>
  </Stack>
</template>
