<script setup lang="ts">
  import { Combobox, Stack, Text } from '@hina-ui/vue'
  import type { ValueDraft } from '~/features/wiki/editor/draft'
  import { describeFound, type WikiSearchItem } from '~/features/wiki/entries'

  defineOptions({ name: 'WikiFieldTarget' })

  type Target = NonNullable<ValueDraft['target']>
  type EntryType = WikiSearchItem['type']

  const props = defineProps<{ types: EntryType[]; label: string; placeholder?: string }>()
  const target = defineModel<Target | null>({ required: true })
  const { typeName } = useWikiDefinitions()

  const search = ref('')
  const found = shallowRef<WikiSearchItem[]>([])
  const loading = ref(false)
  let sequence = 0

  watchDebounced(
    search,
    async text => {
      const seq = ++sequence
      const keyword = text.trim()
      if (!keyword || keyword === target.value?.label) return
      loading.value = true
      try {
        const items = await hikariRequest('/api/v3/wiki/entries', {
          query: { q: keyword.slice(0, 100), types: props.types },
          toast: false,
        })
        if (seq === sequence) found.value = items
      } catch {
        if (seq === sequence) found.value = []
      } finally {
        if (seq === sequence) loading.value = false
      }
    },
    { debounce: 250 },
  )

  const options = computed(() =>
    found.value.map(item => ({
      value: item.id,
      label: item.label,
      hint: describeFound(item, typeName(item.type)),
    })),
  )
  const selected = computed(() =>
    target.value ? { value: target.value.id, label: target.value.label, hint: '' } : null,
  )

  function pick(value: string | number | null | undefined) {
    if (value === null || value === undefined) {
      target.value = null
      return
    }
    const item = found.value.find(entry => entry.id === Number(value))
    if (item) target.value = { id: item.id, type: item.type, label: item.label }
  }
</script>

<template>
  <Combobox
    v-model:search="search"
    :model-value="target?.id ?? null"
    :options="options"
    :selected-option="selected"
    :loading="loading"
    :aria-label="label"
    :placeholder="placeholder ?? '按名字查找'"
    ignore-filter
    clearable
    @update:model-value="pick"
  >
    <template #option="{ option }">
      <Stack gap="none" class="min-w-0">
        <Text as="span" size="sm" lang="ja" truncate>{{ option.label }}</Text>
        <Text v-if="option.hint" as="span" size="xs" tone="muted" truncate>{{ option.hint }}</Text>
      </Stack>
    </template>
  </Combobox>
</template>
