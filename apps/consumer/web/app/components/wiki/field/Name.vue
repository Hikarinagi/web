<script setup lang="ts">
  import { Autocomplete, IconButton, Stack, Text } from '@hina-ui/vue'
  import { ArrowUpRight, Link2 } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { ValueDraft } from '~/features/wiki/editor/draft'
  import { describeFound, type WikiSearchItem } from '~/features/wiki/entries'

  defineOptions({ name: 'WikiFieldName' })

  defineProps<{ label: string; placeholder?: string }>()
  const model = defineModel<Pick<ValueDraft, 'text' | 'target'>>({ required: true })
  const { typeName } = useWikiDefinitions()

  const found = shallowRef<WikiSearchItem[]>([])
  const loading = ref(false)
  let sequence = 0
  const text = computed(() => model.value.text ?? '')

  watchDebounced(
    text,
    async value => {
      const seq = ++sequence
      const keyword = value.trim()
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

  function input(value: string) {
    model.value = value ? { ...model.value, text: value } : { text: null, target: null }
  }

  function pick(id: string | number, label: string) {
    const item = found.value.find(entry => entry.id === Number(id))
    if (item)
      model.value = {
        text: label || item.label,
        target: { id: item.id, type: item.type, label: item.label },
      }
  }
</script>

<template>
  <Autocomplete
    :model-value="text"
    :options="options"
    :loading="loading"
    :aria-label="label"
    :placeholder="placeholder ?? '名字'"
    @update:model-value="input"
    @select="selection => pick(selection.option.value, selection.option.label)"
  >
    <template v-if="model.target" #leading><Link2 class="size-4 text-accent-text" /></template>
    <template v-if="model.target" #trailing>
      <IconButton
        :as="NuxtLink"
        :to="`/entries/${model.target.id}/edit`"
        :label="`打开「${model.target.label}」`"
        variant="ghost"
        tone="neutral"
        size="xs"
      >
        <ArrowUpRight />
      </IconButton>
    </template>
    <template #option="{ option }">
      <Stack gap="none" class="min-w-0">
        <Text as="span" size="sm" lang="ja" truncate>{{ option.label }}</Text>
        <Text as="span" size="xs" tone="muted" truncate>{{ option.hint }}</Text>
      </Stack>
    </template>
  </Autocomplete>
</template>
