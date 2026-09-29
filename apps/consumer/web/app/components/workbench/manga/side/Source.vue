<script setup lang="ts">
  import { Inline, SegmentedControl, Stack, Tag, Text, Textarea } from '@hina-ui/vue'
  import { MANGA_POSITION_OPTIONS } from '~/features/workbench/manga/labels'
  import type { BackendMangaRegion } from '~/features/workbench/manga/manga'

  const props = defineProps<{
    region: BackendMangaRegion
    editable: boolean
    locked: boolean
    labelplus: boolean
  }>()
  const emit = defineEmits<{
    update: [patch: { source_text?: string; position?: 'INSIDE' | 'OUTSIDE' }, id: string]
    focus: []
  }>()

  const positionLabel = useId()
  const draft = ref(props.region.source_text)
  watch(
    () => props.region.source_text,
    text => {
      if (text !== draft.value) draft.value = text
    },
  )
  const commit = () => {
    if (draft.value !== props.region.source_text) {
      emit('update', { source_text: draft.value }, props.region.id)
    }
  }
  const debounced = useDebounceFn(commit, 500)
  watch(draft, () => void debounced())
  onBeforeUnmount(commit)
</script>

<template>
  <Stack gap="sm">
    <Inline v-if="region.machine || locked" gap="xs" align="center">
      <Tag v-if="region.machine" size="sm" tone="warning" variant="outline">自动识别</Tag>
      <Tag v-if="locked" size="sm" tone="warning" variant="soft">正在被其他成员编辑</Tag>
    </Inline>
    <Textarea
      v-model="draft"
      :rows="3"
      autosize
      :readonly="!editable || locked"
      placeholder="框里的原文"
      aria-label="原文"
      @focus="emit('focus')"
      @blur="commit"
    />
    <Inline v-if="labelplus" gap="sm" align="center" justify="between" :wrap="false">
      <Inline gap="xs" align="center" :wrap="false">
        <Text :id="positionLabel" as="span" size="sm" tone="muted">文字位置</Text>
        <Question
          :show-dialog="false"
          tooltip="对话气泡或旁白框里的文字选「框内」，直接画在画面上的文字（例如拟声词）选「框外」。导出的 LabelPlus 翻译稿按此设置对文字进行分组。"
          aria-label="文字位置说明"
        />
      </Inline>
      <SegmentedControl
        :model-value="region.position"
        :options="MANGA_POSITION_OPTIONS"
        size="sm"
        :disabled="!editable || locked"
        :aria-labelledby="positionLabel"
        @update:model-value="
          value => emit('update', { position: value as 'INSIDE' | 'OUTSIDE' }, region.id)
        "
      />
    </Inline>
  </Stack>
</template>
