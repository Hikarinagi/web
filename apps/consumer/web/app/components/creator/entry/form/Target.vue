<script setup lang="ts">
  import { Combobox, Inline, Stack, Tag, Text } from '@hina-ui/vue'
  import {
    ENTRY_TYPE_NAMES,
    type BackendEntryType,
    type BackendStatement,
  } from '~/features/creator/entry/contract'

  defineOptions({ name: 'CreatorEntryFormTarget' })
  const props = defineProps<{
    types: BackendEntryType[]
    selected?: BackendStatement['target']
    exclude?: number
  }>()
  const target = defineModel<number | null>({ required: true })

  interface Option {
    value: number
    label: string
    hint: string | null
    type: string
  }
  const names = inject(
    ENTRY_TYPE_NAMES,
    computed<Record<string, string>>(() => ({})),
  )
  const search = ref('')
  const keyword = refDebounced(search, 250)
  const loading = ref(false)
  const options = ref<Option[]>([])
  const chosen = computed<Option | null>(() =>
    props.selected
      ? {
          value: props.selected.id,
          label: props.selected.label,
          hint: null,
          type: props.selected.type,
        }
      : null,
  )
  let latest = 0

  watch(keyword, async value => {
    const text = value.trim()
    const request = ++latest
    if (!text) {
      options.value = []
      return
    }
    loading.value = true
    try {
      const items = await hikariRequest('/api/v3/wiki/entries', {
        query: { q: text, types: props.types },
        toast: false,
      })
      if (request !== latest) return
      options.value = items
        .filter(item => item.id !== props.exclude)
        .map(item => ({
          value: item.id,
          label: item.label,
          hint: item.chinese_title,
          type: item.type,
        }))
    } catch {
      if (request === latest) options.value = []
    } finally {
      if (request === latest) loading.value = false
    }
  })
</script>

<template>
  <Combobox
    v-model="target"
    v-model:search="search"
    variant="secondary"
    :options="options"
    :selected-option="chosen"
    :loading="loading"
    ignore-filter
    clearable
    placeholder="按标题搜索"
  >
    <template #option="{ option }">
      <Inline gap="sm" align="start" :wrap="false" class="min-w-0">
        <Tag v-if="types.length > 1" tone="neutral">
          {{ names[option.type] ?? option.type }}
        </Tag>
        <Stack gap="none" class="min-w-0">
          <Text as="span" size="sm" lang="ja">{{ option.label }}</Text>
          <Text v-if="option.hint" as="span" size="xs" tone="muted">{{ option.hint }}</Text>
        </Stack>
      </Inline>
    </template>
  </Combobox>
</template>
