<script setup lang="ts">
  import { Autocomplete, IconButton, Stack, Text } from '@hina-ui/vue'
  import { ArrowUpRight, Link2 } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { ValueDraft } from '~/features/wiki/editor/draft'
  import { describeFound, type WikiSearchItem } from '~/features/wiki/entries'

  defineOptions({ name: 'WikiFieldTarget' })

  type Target = NonNullable<ValueDraft['target']>
  type EntryType = WikiSearchItem['type']

  const props = defineProps<{ types: EntryType[]; label: string; placeholder?: string }>()
  const target = defineModel<Target | null>({ required: true })
  const { typeName } = useWikiDefinitions()

  const text = ref(target.value?.label ?? '')
  watch(target, next => {
    if (next) text.value = next.label
  })
  const found = shallowRef<WikiSearchItem[]>([])
  const loading = ref(false)
  let sequence = 0

  watchDebounced(
    text,
    async value => {
      const seq = ++sequence
      const keyword = value.trim()
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

  function input(value: string) {
    text.value = value
    if (target.value && value !== target.value.label) target.value = null
  }

  function pick(id: string | number) {
    const item = found.value.find(entry => entry.id === Number(id))
    if (item) target.value = { id: item.id, type: item.type, label: item.label }
  }
</script>

<template>
  <Autocomplete
    :model-value="text"
    :options="options"
    :loading="loading"
    :aria-label="label"
    :placeholder="placeholder ?? '输入名称查找条目'"
    :invalid="Boolean(text.trim()) && !target"
    @update:model-value="input"
    @select="selection => pick(selection.option.value)"
  >
    <template v-if="target" #leading><Link2 class="size-4 text-accent-text" /></template>
    <template v-if="target" #trailing>
      <IconButton
        :as="NuxtLink"
        :to="`/entries/${target.id}/edit`"
        :label="`打开「${target.label}」`"
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
        <Text v-if="option.hint" as="span" size="xs" tone="muted" truncate>{{ option.hint }}</Text>
      </Stack>
    </template>
  </Autocomplete>
</template>
