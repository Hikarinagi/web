<script setup lang="ts">
  import { Button, Card, IconButton, Inline, Link, NumberInput, Stack, Text } from '@hina-ui/vue'
  import { Plus, X } from '@lucide/vue'
  import type { BackendEditorField } from '~/features/creator/editor'

  const props = defineProps<{
    field: BackendEditorField
    disabled?: boolean
  }>()
  const model = defineModel<Record<string, unknown>[]>({ default: () => [] })

  const maxRows = computed(() => props.field.max_length ?? 10)
  const canAdd = computed(() => model.value.length < maxRows.value)

  function appId(row: Record<string, unknown>): number | null {
    return typeof row.app_id === 'number' ? row.app_id : null
  }

  const idCounts = computed(() => {
    const counts = new Map<number, number>()
    for (const row of model.value) {
      const id = appId(row)
      if (id !== null) counts.set(id, (counts.get(id) ?? 0) + 1)
    }
    return counts
  })
  function isDuplicate(row: Record<string, unknown>): boolean {
    const id = appId(row)
    return id !== null && (idCounts.value.get(id) ?? 0) > 1
  }

  function setRow(index: number, value: number | null) {
    const next = model.value.slice()
    const current = next[index]
    if (!current) return
    next[index] = { ...current, app_id: value }
    model.value = next
  }

  function addRow() {
    if (!canAdd.value) return
    model.value = [...model.value, { app_id: null }]
  }

  function removeRow(index: number) {
    model.value = model.value.filter((_, i) => i !== index)
  }
</script>

<template>
  <Stack gap="sm" align="stretch">
    <Card v-for="(row, index) in model" :key="index" :padded="false">
      <Inline gap="sm" align="center" :wrap="false" class="p-2">
        <NumberInput
          :model-value="appId(row)"
          placeholder="1144400"
          size="sm"
          :min="1"
          :format-options="{ useGrouping: false }"
          :invalid="isDuplicate(row)"
          :disabled="disabled"
          class="min-w-0 flex-1"
          @update:model-value="value => setRow(index, typeof value === 'number' ? value : null)"
        />
        <Link
          v-if="appId(row)"
          :href="`https://store.steampowered.com/app/${appId(row)}/`"
          target="_blank"
          rel="noopener noreferrer"
          tone="neutral"
          class="shrink-0 text-xs"
        >
          打开商店页
        </Link>
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
      添加 Steam App
    </Button>

    <Text size="xs" tone="muted">{{ model.length }} / {{ maxRows }}</Text>
  </Stack>
</template>
