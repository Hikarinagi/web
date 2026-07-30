<script setup lang="ts">
  import type { BackendEntitySummary } from '~/features/creator/editor'
  import { fetchEntitySearch } from '~/features/creator/composables/useEntitySearch'
  import { toRelationRows, type EditorRelationRow } from '~/features/creator/editor/relation'

  interface ChipValue {
    id: number
    name: string
    cover: string | null
    attributes?: Record<string, unknown>
  }

  const model = defineModel<EditorRelationRow[]>({ default: () => [] })

  const rows = computed(() => toRelationRows(model.value))

  const selected = computed<ChipValue[]>({
    get: () =>
      rows.value.map(row => ({
        id: row.target_id,
        name: row.target.name || `#${row.target_id}`,
        cover: row.target.cover,
        attributes: row.attributes,
      })),
    set: next => {
      model.value = next.map(item => ({
        target_id: item.id,
        target: { name: item.name, cover: item.cover },
        attributes: item.attributes ?? {},
      }))
    },
  })

  const suggestions = ref<BackendEntitySummary[]>([])
  const loading = ref(false)

  async function complete(event: { query: string }) {
    loading.value = true
    try {
      const items = await fetchEntitySearch('tag', event.query, 10)
      const exclude = new Set(rows.value.map(row => row.target_id))
      suggestions.value = items.filter(item => !exclude.has(item.id))
    } catch {
      suggestions.value = []
    } finally {
      loading.value = false
    }
  }
</script>

<template>
  <AutoComplete
    v-model="selected"
    :suggestions="suggestions"
    :loading="loading"
    multiple
    option-label="name"
    data-key="id"
    placeholder="搜索以添加…"
    fluid
    @complete="complete"
  >
    <template #option="{ option }">
      <div class="flex items-center gap-2">
        <HikariImage
          v-if="option.cover"
          :src="option.cover"
          alt=""
          preset="small"
          class="size-7 shrink-0 rounded"
          image-class="object-cover"
        >
          <template #empty><span /></template>
          <template #error><span /></template>
        </HikariImage>
        <span class="truncate">{{ option.name }}</span>
        <span class="ml-auto shrink-0 font-mono text-xs text-muted-color">#{{ option.id }}</span>
      </div>
    </template>
  </AutoComplete>
</template>
