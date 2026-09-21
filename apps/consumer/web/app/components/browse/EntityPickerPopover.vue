<script setup lang="ts">
  import {
    Card,
    Popover,
    Ripple,
    ScrollArea,
    SearchInput,
    Skeleton,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import { Check } from '@lucide/vue'
  import { BROWSE_FILTER_RECALL_KEY } from '~/features/browse/filter'

  defineOptions({ name: 'BrowseEntityPickerPopover' })

  const props = defineProps<{
    kind: string
    noun: string
    load: (search?: string) => Promise<{ id: number; name: string }[]>
    modelValue?: number
    disabled?: boolean
  }>()
  const emit = defineEmits<{ 'update:modelValue': [value: number | undefined] }>()

  const filter = inject(BROWSE_FILTER_RECALL_KEY)
  const open = ref(false)
  const query = ref('')
  const results = ref<{ id: number; name: string }[]>([])
  const loading = ref(false)
  const searched = ref(false)
  let seq = 0

  const active = computed(() => props.modelValue != null)
  const label = computed(() =>
    props.modelValue != null
      ? (filter?.entityLabel(props.kind, props.modelValue) ?? props.noun)
      : props.noun,
  )

  async function fetchList() {
    const current = ++seq
    loading.value = true
    try {
      const rows = await props.load(query.value.trim() || undefined)
      if (current !== seq) return
      results.value = rows
      searched.value = true
    } catch {
      if (current !== seq) return
      results.value = []
    } finally {
      if (current === seq) loading.value = false
    }
  }

  const debouncedFetch = useDebounceFn(fetchList, 250)
  watch(query, () => {
    searched.value = false
    void debouncedFetch()
  })

  watch(open, value => {
    if (value && !results.value.length) void fetchList()
  })

  function select(row: { id: number; name: string } | null) {
    if (row) filter?.remember(props.kind, [row])
    emit('update:modelValue', row?.id)
    open.value = false
  }
</script>

<template>
  <Popover v-model:open="open" :padded="false" class="w-72 max-w-[calc(100vw-2rem)]">
    <BrowseFilterTrigger :label="label" :active="active" :disabled="disabled" />

    <template #content>
      <Stack gap="sm" class="p-2">
        <SearchInput v-model="query" size="sm" clearable :placeholder="`搜索${noun}…`" />

        <ScrollArea class="max-h-64" :aria-busy="loading">
          <Stack v-if="loading" gap="xs" role="status" aria-label="搜索中">
            <Skeleton v-for="index in 5" :key="index" class="h-8" />
          </Stack>
          <template v-else>
            <Card
              as="button"
              :padded="false"
              class="hn-state-layer flex w-full hn-interactive items-center gap-2 rounded-md border-0 bg-transparent px-2 py-1.5 text-left shadow-none hn-press-none"
              @click="select(null)"
            >
              <Ripple />
              <Text as="span" size="sm" truncate class="min-w-0 flex-1">全部{{ noun }}</Text>
              <Check v-if="!active" class="size-4 shrink-0 text-accent-text" />
            </Card>
            <Card
              v-for="row in results"
              :key="row.id"
              as="button"
              :padded="false"
              class="hn-state-layer flex w-full hn-interactive items-center gap-2 rounded-md border-0 bg-transparent px-2 py-1.5 text-left shadow-none hn-press-none"
              @click="select(row)"
            >
              <Ripple />
              <Text as="span" size="sm" truncate class="min-w-0 flex-1">{{ row.name }}</Text>
              <Check v-if="row.id === modelValue" class="size-4 shrink-0 text-accent-text" />
            </Card>
            <Text
              v-if="searched && !results.length"
              size="xs"
              tone="faint"
              class="px-2 py-3 text-center"
            >
              没有匹配的{{ noun }}
            </Text>
          </template>
        </ScrollArea>
      </Stack>
    </template>
  </Popover>
</template>
