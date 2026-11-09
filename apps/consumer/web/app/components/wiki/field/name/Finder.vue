<script setup lang="ts">
  import { Button, Checkbox, Combobox, Dialog, Empty, Inline, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { ValueDraft } from '~/features/wiki/editor/draft'
  import { useEntryNames } from '~/features/wiki/composables/useEntryNames'
  import { useEntrySearch } from '~/features/wiki/composables/useEntrySearch'
  import { describeFound, sameName, type WikiSearchItem } from '~/features/wiki/entries'

  defineOptions({ name: 'WikiFieldNameFinder' })

  const props = defineProps<{ label: string; credited: string; current: number | null }>()
  const open = defineModel<boolean>('open', { required: true })
  const emit = defineEmits<{
    link: [target: NonNullable<ValueDraft['target']>, addName: boolean]
  }>()
  const { typeName } = useWikiDefinitions()

  const query = ref('')
  const picked = shallowRef<WikiSearchItem | null>(null)
  const addName = ref(true)
  const { found, loading } = useEntrySearch(
    () => (picked.value && query.value === picked.value.label ? '' : query.value),
    ['PERSON', 'ORGANIZATION'],
  )
  const optionOf = (item: WikiSearchItem) => ({
    value: item.id,
    label: item.label,
    description: item.matched
      ? `其他名字：${item.matched}`
      : describeFound(item, typeName(item.type)),
  })
  const options = computed(() =>
    found.value.filter(item => item.id !== props.current).map(optionOf),
  )
  const names = useEntryNames(
    () => picked.value?.id ?? null,
    () => picked.value !== null && Boolean(props.credited),
  )
  const offer = computed(
    () =>
      Boolean(props.credited) &&
      names.value !== null &&
      !names.value.some(name => sameName(name, props.credited)),
  )
  const missing = computed(
    () => Boolean(query.value.trim()) && !loading.value && !options.value.length && !picked.value,
  )

  watch(open, next => {
    if (!next) return
    query.value = ''
    picked.value = null
    addName.value = true
  })

  function pick(value: string | number | null | undefined) {
    picked.value = found.value.find(item => item.id === value) ?? null
  }

  function link() {
    const item = picked.value
    if (!item) return
    emit('link', { id: item.id, type: item.type, label: item.label }, offer.value && addName.value)
    open.value = false
  }
</script>

<template>
  <Dialog v-model:open="open" title="关联人物或组织" size="md">
    <template #content>
      <Stack gap="md" class="text-pretty">
        <Inline v-if="credited" gap="sm" align="baseline" :wrap="false">
          <Text size="sm" tone="muted" class="shrink-0">{{ label }}</Text>
          <Text size="sm" lang="ja">{{ credited }}</Text>
        </Inline>
        <Combobox
          v-model:search="query"
          :model-value="picked?.id ?? null"
          :options="options"
          :selected-option="picked ? optionOf(picked) : null"
          :loading="loading"
          ignore-filter
          placeholder="本名或其他名字"
          aria-label="按其他名字查找"
          @update:model-value="pick"
        >
          <template #option="{ option }">
            <Stack gap="none" class="min-w-0">
              <Text size="sm" lang="ja" truncate>{{ option.label }}</Text>
              <Text size="xs" tone="muted" lang="ja" truncate>{{ option.description }}</Text>
            </Stack>
          </template>
        </Combobox>
        <Empty v-if="missing" size="sm" title="未找到">
          <template #actions>
            <Button
              :as="NuxtLink"
              :to="{ path: '/create/wiki/new', query: { type: 'PERSON', q: query.trim() } }"
              target="_blank"
              size="sm"
              variant="outline"
              tone="neutral"
            >
              新建人物「{{ query.trim() }}」
            </Button>
          </template>
        </Empty>
        <Checkbox v-if="offer && picked" v-model="addName">
          将「{{ credited }}」添加为{{ picked.label }}的其他名字
        </Checkbox>
      </Stack>
    </template>
    <template #footer>
      <Button variant="ghost" tone="neutral" @click="open = false">取消</Button>
      <Button :disabled="!picked" @click="link">关联</Button>
    </template>
  </Dialog>
</template>
