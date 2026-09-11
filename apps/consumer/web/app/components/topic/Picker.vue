<script setup lang="ts">
  import { Inline, Listbox, SearchInput, Skeleton, Stack, Tag, Text } from '@hina-ui/vue'
  import type { SelectItems, SelectOption } from '@hina-ui/vue'
  import { Check, Hash } from '@lucide/vue'
  import type { TopicOption, TopicSection } from './useTopics'

  defineOptions({ name: 'TopicPicker' })

  const props = defineProps<{
    loading: boolean
    sections: TopicSection[]
    canCreate: boolean
    kw: string
    selectedIds: Set<number>
  }>()
  const query = defineModel<string>('query', { required: true })
  const emit = defineEmits<{ pick: [topic: TopicOption]; create: [] }>()

  const CREATE_VALUE = '__create__'
  const SKELETON_WIDTHS = ['w-2/3', 'w-5/6', 'w-1/2', 'w-3/4', 'w-3/5']

  const options = computed<SelectItems<SelectOption<{ count?: number }>>>(() => [
    ...(props.canCreate ? [{ value: CREATE_VALUE, label: props.kw }] : []),
    ...props.sections.map(section => ({
      label: section.label,
      options: section.items.map(item => ({
        value: item.id,
        label: item.name,
        count: item.use_count,
      })),
    })),
  ])
  const selected = computed(() => [...props.selectedIds])

  function onSelect(next: string | number | (string | number)[] | null | undefined) {
    const values = Array.isArray(next) ? next : []
    if (values.includes(CREATE_VALUE)) {
      emit('create')
      return
    }
    const ids = values.map(Number)
    const added = ids.find(id => !props.selectedIds.has(id))
    const changed = added ?? [...props.selectedIds].find(id => !ids.includes(id))
    if (changed === undefined) return
    const topic = props.sections.flatMap(section => section.items).find(item => item.id === changed)
    if (topic) emit('pick', topic)
  }

  function formatCount(n: number) {
    return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(n)
  }
</script>

<template>
  <Stack gap="sm" class="w-72 p-1.5">
    <SearchInput v-model="query" size="sm" clearable placeholder="搜索或输入新话题…" />

    <Stack v-if="loading" gap="sm">
      <Skeleton v-for="width in SKELETON_WIDTHS" :key="width" :class="`h-6 rounded-md ${width}`" />
    </Stack>

    <Listbox
      v-else
      :model-value="selected"
      :options="options"
      multiple
      variant="bare"
      :padded="false"
      max-height="16rem"
      aria-label="话题"
      @update:model-value="onSelect"
    >
      <template #option="{ option }">
        <Inline as="span" gap="xs" align="center" class="min-w-0">
          <Hash class="shrink-0 text-accent-text" aria-hidden="true" />
          <Text as="span" size="sm" truncate>{{ option.label }}</Text>
        </Inline>
      </template>

      <template #trailing="{ option, selected: picked }">
        <Tag v-if="option.value === CREATE_VALUE" class="shrink-0">创建</Tag>
        <Check v-else-if="picked" class="shrink-0 text-accent-text" aria-hidden="true" />
        <Text v-else as="span" size="xs" tone="muted" class="shrink-0 tabular-nums">
          {{ formatCount(option.count ?? 0) }}
        </Text>
      </template>
    </Listbox>
  </Stack>
</template>
