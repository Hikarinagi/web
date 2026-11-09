<script setup lang="ts">
  import { Button, Combobox, Dialog, Empty, Inline, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { useEntrySearch } from '~/features/wiki/composables/useEntrySearch'
  import { describeFound, type WikiSearchItem } from '~/features/wiki/entries'

  defineOptions({ name: 'WikiEditorPick' })

  const props = withDefaults(
    defineProps<{
      open: boolean
      title: string
      types: WikiSearchItem['type'][]
      exclude: number[]
      confirm: string
      ready?: boolean
      create?: WikiSearchItem['type']
      taken?: number[]
      note?: string
      placeholder?: string
    }>(),
    { ready: true, create: undefined, taken: undefined, note: undefined, placeholder: undefined },
  )
  const emit = defineEmits<{ close: []; pick: [item: WikiSearchItem] }>()
  defineSlots<{ default?: (props: { picked: WikiSearchItem | null }) => unknown }>()
  const { typeName } = useWikiDefinitions()
  const visible = computed({
    get: () => props.open,
    set: next => {
      if (!next) emit('close')
    },
  })
  const query = ref('')
  const picked = shallowRef<WikiSearchItem | null>(null)
  const { found, loading } = useEntrySearch(
    () => (picked.value && query.value === picked.value.label ? '' : query.value),
    props.types,
  )

  watch(visible, next => {
    if (!next) return
    query.value = ''
    picked.value = null
  })

  const work = (item: WikiSearchItem) =>
    item.type === 'APPEARANCE' && item.owner ? item.owner : item
  const optionOf = (item: WikiSearchItem) => {
    const taken = props.taken?.includes(item.id) ?? false
    return {
      value: item.id,
      label: item.type === 'APPEARANCE' ? work(item).label : item.label,
      item,
      disabled: taken,
      description: taken ? (props.note ?? '已添加') : undefined,
    }
  }
  const options = computed(() =>
    found.value.filter(item => !props.exclude.includes(item.id)).map(optionOf),
  )
  const missing = computed(
    () => Boolean(query.value.trim()) && !loading.value && !options.value.length && !picked.value,
  )
  const carded = (item: WikiSearchItem) =>
    item.type === 'GAME' || item.type === 'SERIES' || item.type === 'APPEARANCE'

  function pick(value: string | number | null | undefined) {
    picked.value = found.value.find(item => item.id === value) ?? null
  }

  function submit() {
    if (picked.value) emit('pick', picked.value)
  }
</script>

<template>
  <Dialog v-model:open="visible" :title="title" size="lg">
    <template #content>
      <Stack gap="md">
        <Combobox
          v-model:search="query"
          :model-value="picked?.id ?? null"
          :options="options"
          :selected-option="picked ? optionOf(picked) : null"
          :loading="loading"
          ignore-filter
          :placeholder="placeholder ?? '名字'"
          aria-label="搜索名字"
          @update:model-value="pick"
        >
          <template #option="{ option }">
            <Inline gap="md" align="center" :wrap="false" class="min-w-0">
              <WikiWorkLine
                v-if="carded(option.item)"
                :work="work(option.item)"
                :card="option.item"
                class="min-w-0 flex-1"
              />
              <Stack v-else gap="none" class="min-w-0 flex-1">
                <Text size="sm" lang="ja" truncate>{{ option.label }}</Text>
                <Text size="xs" tone="muted" truncate>
                  {{ describeFound(option.item, typeName(option.item.type)) }}
                </Text>
              </Stack>
              <Stack
                v-if="option.item.type === 'APPEARANCE' || option.description"
                gap="none"
                class="max-w-48 shrink-0 text-right"
              >
                <Text v-if="option.item.type === 'APPEARANCE'" size="sm" lang="ja" truncate>
                  {{ option.item.label }}
                </Text>
                <Text size="xs" tone="muted" lang="ja" truncate>
                  {{ option.description ?? option.item.voices.join('、') }}
                </Text>
              </Stack>
            </Inline>
          </template>
        </Combobox>
        <Empty v-if="missing" size="sm" title="未找到">
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
        <Inline
          v-if="picked && carded(picked)"
          gap="md"
          align="center"
          :wrap="false"
          class="min-w-0"
        >
          <WikiWorkLine :work="work(picked)" :card="picked" class="min-w-0 flex-1" />
          <Stack v-if="picked.type === 'APPEARANCE'" gap="none" class="shrink-0 text-right">
            <Text size="sm" lang="ja">{{ picked.label }}</Text>
            <Text size="xs" tone="muted" lang="ja">
              {{ picked.voices.join('、') || '配音未记录' }}
            </Text>
          </Stack>
        </Inline>
        <slot :picked="picked" />
      </Stack>
    </template>
    <template #footer>
      <Button variant="ghost" tone="neutral" @click="visible = false">取消</Button>
      <Button :disabled="!picked || !ready" @click="submit">{{ confirm }}</Button>
    </template>
  </Dialog>
</template>
