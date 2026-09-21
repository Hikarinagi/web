<script setup lang="ts">
  import { Button, Card, IconButton, Inline, Input, Stack, Text } from '@hina-ui/vue'
  import { Plus, X } from '@lucide/vue'
  import type { BackendEditorField } from '~/features/creator/editor'

  const props = defineProps<{
    field: BackendEditorField
    disabled?: boolean
  }>()
  const model = defineModel<Record<string, unknown>[]>({ default: () => [] })

  const maxRows = computed(() => props.field.max_length ?? 50)
  const canAdd = computed(() => model.value.length < maxRows.value)

  function text(row: Record<string, unknown>, key: 'name' | 'label' | 'url'): string {
    const value = row[key]
    return typeof value === 'string' ? value : ''
  }

  const urlCounts = computed(() => {
    const counts = new Map<string, number>()
    for (const row of model.value) {
      const key = text(row, 'url').trim()
      if (key) counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return counts
  })
  function isDuplicate(row: Record<string, unknown>): boolean {
    const key = text(row, 'url').trim()
    return key !== '' && (urlCounts.value.get(key) ?? 0) > 1
  }

  function setRow(index: number, key: 'name' | 'label' | 'url', value: string) {
    const next = model.value.slice()
    const current = next[index]
    if (!current) return
    next[index] = { ...current, [key]: value }
    model.value = next
  }

  function addRow() {
    if (!canAdd.value) return
    model.value = [...model.value, { name: '', label: '', url: '' }]
  }

  function removeRow(index: number) {
    model.value = model.value.filter((_, i) => i !== index)
  }
</script>

<template>
  <Stack gap="sm" align="stretch">
    <Card v-for="(row, index) in model" :key="index" :padded="false">
      <Inline gap="sm" align="center" :wrap="false" class="p-2">
        <Input
          :model-value="text(row, 'name')"
          placeholder="来源标识，如 steam"
          size="sm"
          :disabled="disabled"
          class="min-w-0 flex-1"
          @update:model-value="value => setRow(index, 'name', value ?? '')"
        />
        <Input
          :model-value="text(row, 'label')"
          placeholder="显示名称"
          size="sm"
          :disabled="disabled"
          class="min-w-0 flex-1"
          @update:model-value="value => setRow(index, 'label', value ?? '')"
        />
        <Input
          :model-value="text(row, 'url')"
          placeholder="https://"
          size="sm"
          :disabled="disabled"
          :invalid="isDuplicate(row)"
          class="min-w-0 flex-2"
          @update:model-value="value => setRow(index, 'url', value ?? '')"
        />
        <IconButton
          :label="`移除第 ${index + 1} 行`"
          variant="ghost"
          tone="danger"
          size="sm"
          pill
          :disabled="disabled"
          class="shrink-0"
          @click="removeRow(index)"
        >
          <X />
        </IconButton>
      </Inline>
    </Card>

    <Button
      variant="outline"
      tone="neutral"
      size="sm"
      class="self-start"
      :disabled="disabled || !canAdd"
      @click="addRow"
    >
      <template #icon><Plus /></template>
      添加链接
    </Button>

    <Text size="xs" tone="muted">{{ model.length }} / {{ maxRows }}</Text>
  </Stack>
</template>
