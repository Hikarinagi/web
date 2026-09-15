<script setup lang="ts">
  import { Inline, MultiCombobox, Text, type SelectOption } from '@hina-ui/vue'
  import { refDebounced } from '@vueuse/core'
  import type { BackendEntitySummary } from '~/features/creator/editor'
  import { fetchEntitySearch } from '~/features/creator/composables/useEntitySearch'
  import { toRelationRows, type EditorRelationRow } from '~/features/creator/editor/relation'

  type TagOption = SelectOption<{ cover: string | null }>

  const model = defineModel<EditorRelationRow[]>({ default: () => [] })

  const rows = computed(() => toRelationRows(model.value))

  const search = ref('')
  const keyword = refDebounced(search, 300)
  const results = ref<BackendEntitySummary[]>([])
  const loading = ref(false)

  watch(keyword, async value => {
    if (!value.trim()) {
      results.value = []
      return
    }
    loading.value = true
    try {
      results.value = await fetchEntitySearch('tag', value, 10)
    } catch {
      results.value = []
    } finally {
      loading.value = false
    }
  })

  const selectedOptions = computed<TagOption[]>(() =>
    rows.value.map(row => ({
      value: row.target_id,
      label: row.target.name || `#${row.target_id}`,
      cover: row.target.cover,
    })),
  )

  const options = computed<TagOption[]>(() =>
    results.value.map(item => ({ value: item.id, label: item.name, cover: item.cover })),
  )

  const selected = computed<Array<string | number>>({
    get: () => rows.value.map(row => row.target_id),
    set: next => {
      const existing = new Map(rows.value.map(row => [row.target_id, row]))
      model.value = next.map(value => {
        const id = Number(value)
        const prev = existing.get(id)
        if (prev) return prev
        const option = options.value.find(item => item.value === id)
        return {
          target_id: id,
          target: { name: option?.label ?? '', cover: option?.cover ?? null },
          attributes: {},
        }
      })
    },
  })
</script>

<template>
  <MultiCombobox
    v-model="selected"
    v-model:search="search"
    :options="options"
    :selected-options="selectedOptions"
    :loading="loading"
    ignore-filter
    placeholder="搜索以添加…"
    aria-label="标签"
  >
    <template #option="{ option }">
      <Inline gap="sm" align="center" :wrap="false" class="min-w-0">
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
        <Text as="span" truncate>{{ option.label }}</Text>
        <Text as="span" size="xs" tone="muted" class="ms-auto shrink-0 font-mono">
          #{{ option.value }}
        </Text>
      </Inline>
    </template>
  </MultiCombobox>
</template>
