<script setup lang="ts">
  import { Button, Dialog, Empty, Listbox, SearchInput, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { describeFound, type WikiSearchItem } from '~/features/wiki/entries'

  defineOptions({ name: 'WikiEditorPick' })

  const props = defineProps<{
    open: boolean
    title: string
    types: WikiSearchItem['type'][]
    exclude: number[]
    confirm: string
    ready?: boolean
    create?: WikiSearchItem['type']
  }>()
  const emit = defineEmits<{ close: []; pick: [item: WikiSearchItem] }>()
  const { typeName } = useWikiDefinitions()
  const visible = computed({
    get: () => props.open,
    set: next => {
      if (!next) emit('close')
    },
  })
  const query = ref('')
  const picked = ref<number | null>(null)
  const found = shallowRef<WikiSearchItem[]>([])
  const loading = ref(false)
  let sequence = 0

  watch(visible, next => {
    if (!next) return
    query.value = ''
    picked.value = null
    found.value = []
  })

  watchDebounced(
    query,
    async text => {
      const seq = ++sequence
      const keyword = text.trim()
      if (!keyword) {
        found.value = []
        return
      }
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
    found.value
      .filter(item => !props.exclude.includes(item.id))
      .map(item => ({
        value: item.id,
        label: item.label,
        hint: describeFound(item, typeName(item.type)),
      })),
  )

  function submit() {
    const item = found.value.find(entry => entry.id === picked.value)
    if (item) emit('pick', item)
  }
</script>

<template>
  <Dialog v-model:open="visible" :title="title" size="md">
    <template #content>
      <Stack gap="md">
        <slot />
        <SearchInput v-model="query" aria-label="搜索名字" placeholder="搜索名字" />
        <Empty v-if="query.trim() && !loading && !options.length" size="sm" title="未找到">
          <template v-if="create" #actions>
            <Button
              :as="NuxtLink"
              :to="{ path: '/create/wiki/new', query: { type: create, q: query.trim() } }"
              size="sm"
              variant="outline"
              tone="neutral"
            >
              新建「{{ query.trim() }}」
            </Button>
          </template>
        </Empty>
        <Listbox
          v-else-if="options.length"
          :model-value="picked"
          :options="options"
          max-height="20rem"
          @update:model-value="value => (picked = typeof value === 'number' ? value : null)"
        >
          <template #option="{ option }">
            <Stack gap="none" class="min-w-0">
              <Text size="sm" weight="medium" lang="ja" truncate>{{ option.label }}</Text>
              <Text v-if="option.hint" size="xs" tone="muted" truncate>{{ option.hint }}</Text>
            </Stack>
          </template>
        </Listbox>
      </Stack>
    </template>
    <template #footer>
      <Button variant="ghost" tone="neutral" @click="visible = false">取消</Button>
      <Button :disabled="picked === null || ready === false" @click="submit">{{ confirm }}</Button>
    </template>
  </Dialog>
</template>
