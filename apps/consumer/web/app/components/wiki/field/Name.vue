<script setup lang="ts">
  import { Combobox, Inline, Stack, Text } from '@hina-ui/vue'
  import { Link2 } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { ValueDraft } from '~/features/wiki/editor/draft'
  import { describeFound, type WikiSearchItem } from '~/features/wiki/entries'

  defineOptions({ name: 'WikiFieldName' })

  defineProps<{ label: string }>()
  const model = defineModel<Pick<ValueDraft, 'text' | 'target'>>({ required: true })
  const { typeName } = useWikiDefinitions()

  const found = shallowRef<WikiSearchItem[]>([])
  const loading = ref(false)
  let sequence = 0
  const search = computed({
    get: () => model.value.text ?? '',
    set: text => {
      if (text !== (model.value.text ?? '')) model.value = { ...model.value, text: text || null }
    },
  })

  watchDebounced(
    search,
    async text => {
      const seq = ++sequence
      const keyword = text.trim()
      if (!keyword) return
      loading.value = true
      try {
        const items = await hikariRequest('/api/v3/wiki/entries', {
          query: { q: keyword.slice(0, 100), types: ['PERSON', 'ORGANIZATION'] },
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
    model.value.target
      ? {
          value: model.value.target.id,
          label: model.value.text ?? model.value.target.label,
          hint: '',
        }
      : null,
  )

  function pick(value: string | number | null | undefined) {
    const item = found.value.find(entry => entry.id === Number(value))
    model.value = item
      ? {
          text: model.value.text || item.label,
          target: { id: item.id, type: item.type, label: item.label },
        }
      : { ...model.value, target: null }
  }
</script>

<template>
  <Inline gap="xs" align="center" :wrap="false" class="min-w-0">
    <IconButton
      v-if="model.target"
      :as="NuxtLink"
      :to="`/entries/${model.target.id}/edit`"
      :label="`已关联：${model.target.label}`"
      variant="ghost"
      tone="accent"
      size="sm"
      class="shrink-0"
    >
      <Link2 />
    </IconButton>
    <Combobox
      v-model:search="search"
      :model-value="model.target?.id ?? null"
      :options="options"
      :selected-option="selected"
      :loading="loading"
      :aria-label="label"
      placeholder="名字"
      ignore-filter
      clearable
      class="min-w-0 flex-1"
      @update:model-value="pick"
      @clear="model = { text: null, target: null }"
    >
      <template #option="{ option }">
        <Stack gap="none" class="min-w-0">
          <Text as="span" size="sm" lang="ja" truncate>{{ option.label }}</Text>
          <Text as="span" size="xs" tone="muted" truncate>{{ option.hint }}</Text>
        </Stack>
      </template>
    </Combobox>
  </Inline>
</template>
