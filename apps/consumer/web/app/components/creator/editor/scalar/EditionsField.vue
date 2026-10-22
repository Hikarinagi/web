<script setup lang="ts">
  import { Button, Stack, Text } from '@hina-ui/vue'
  import { Plus } from '@lucide/vue'
  import type { BackendEditorField, BackendGalgameEditionRow } from '~/features/creator/editor'

  const props = defineProps<{
    field: BackendEditorField
    disabled?: boolean
  }>()
  const model = defineModel<BackendGalgameEditionRow[]>({ default: () => [] })

  const maxRows = computed(() => props.field.max_length ?? 30)
  const canAdd = computed(() => model.value.length < maxRows.value)

  const duplicates = computed(() => {
    const counts = new Map<string, number>()
    for (const row of model.value) {
      const key = row.title?.trim()
      if (key) counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return new Set([...counts].filter(([, count]) => count > 1).map(([key]) => key))
  })

  function setRow(index: number, row: BackendGalgameEditionRow) {
    const next = model.value.slice()
    next[index] = row
    model.value = next
  }
</script>

<template>
  <Stack gap="sm" align="stretch">
    <CreatorEditorScalarEditionRow
      v-for="(row, index) in model"
      :key="index"
      :model-value="row"
      :index="index"
      :duplicate="duplicates.has(row.title?.trim() ?? '')"
      :disabled="disabled"
      @update:model-value="value => setRow(index, value)"
      @remove="model = model.filter((_, i) => i !== index)"
    />
    <Button
      variant="outline"
      tone="neutral"
      size="sm"
      class="self-start"
      :disabled="disabled || !canAdd"
      @click="model = [...model, { title: '' }]"
    >
      <template #icon><Plus /></template>
      添加版本
    </Button>
    <Text size="xs" tone="muted">{{ model.length }} / {{ maxRows }}</Text>
  </Stack>
</template>
