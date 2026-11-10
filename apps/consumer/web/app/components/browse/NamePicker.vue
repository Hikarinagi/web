<script setup lang="ts">
  import { Chip, Combobox, Inline, Stack } from '@hina-ui/vue'
  import { BROWSE_FILTER_RECALL_KEY } from '~/features/browse/filter'

  defineOptions({ name: 'BrowseNamePicker' })
  const props = defineProps<{
    kind: string
    placeholder: string
    load: (search: string) => Promise<{ id: number; name: string }[]>
    single?: boolean
  }>()
  const model = defineModel<number[]>({ required: true })

  const filter = inject(BROWSE_FILTER_RECALL_KEY, null)
  const search = ref('')
  const rows = ref<{ id: number; name: string }[]>([])
  const loading = ref(false)
  let seq = 0

  const find = useDebounceFn(async (text: string) => {
    const current = ++seq
    loading.value = true
    try {
      const list = await props.load(text.trim())
      if (current !== seq) return
      rows.value = list
      filter?.remember(props.kind, list)
    } catch {
      if (current === seq) rows.value = []
    } finally {
      if (current === seq) loading.value = false
    }
  }, 250)

  watch(search, text => void find(text))
  onMounted(() => void find(''))

  const options = computed(() =>
    rows.value
      .filter(row => !model.value.includes(row.id))
      .map(row => ({ value: row.id, label: row.name })),
  )

  function pick(value: string | number | null | undefined) {
    if (value == null || value === '') return
    const id = Number(value)
    model.value = props.single ? [id] : [...model.value, id]
    search.value = ''
  }
</script>

<template>
  <Stack gap="sm">
    <Combobox
      v-model:search="search"
      :model-value="null"
      :options="options"
      ignore-filter
      :loading="loading"
      :placeholder="placeholder"
      :aria-label="placeholder"
      @update:model-value="pick"
    />
    <Inline v-if="model.length" gap="sm">
      <Chip
        v-for="id in model"
        :key="id"
        removable
        @remove="model = model.filter(item => item !== id)"
      >
        {{ filter?.entityLabel(kind, id) ?? `#${id}` }}
      </Chip>
    </Inline>
  </Stack>
</template>
