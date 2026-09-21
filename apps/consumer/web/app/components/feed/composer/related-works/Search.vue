<script setup lang="ts">
  import { Empty, Listbox, ScrollArea, SearchInput, Skeleton, Stack } from '@hina-ui/vue'
  import type { SelectOption } from '@hina-ui/vue'
  import {
    searchEntities,
    type PickedEntity,
  } from '~/components/hikari-editor/plugins/entity-card/search'
  import type { ComposerWork } from '../composables/useComposer'
  import { composerWorkKey, toComposerWork } from './types'

  defineOptions({ name: 'FeedComposerRelatedWorksSearch' })

  const props = defineProps<{ selected: ComposerWork[]; fill?: boolean }>()
  const emit = defineEmits<{ add: [work: ComposerWork] }>()

  const SKELETON_WIDTHS = ['w-2/3', 'w-5/6', 'w-1/2', 'w-3/4']

  const query = ref('')
  const found = shallowRef<PickedEntity[]>([])
  const loading = ref(false)

  const runSearch = useDebounceFn(async (keyword: string) => {
    if (!keyword) {
      found.value = []
      loading.value = false
      return
    }
    const [galgames, lightNovels, mangas] = await Promise.all([
      searchEntities('galgame', keyword),
      searchEntities('light_novel', keyword),
      searchEntities('manga', keyword),
    ])
    const taken = new Set(props.selected.map(composerWorkKey))
    found.value = [...galgames, ...lightNovels, ...mangas].filter(
      entity => !taken.has(composerWorkKey(toComposerWork(entity))),
    )
    loading.value = false
  }, 300)

  watch(query, value => {
    const keyword = value.trim()
    loading.value = keyword.length > 0
    void runSearch(keyword)
  })

  const options = computed<SelectOption<{ entity: PickedEntity }>[]>(() =>
    found.value.map(entity => ({
      value: composerWorkKey(toComposerWork(entity)),
      label: entity.display.title,
      entity,
    })),
  )
  const searched = computed(() => query.value.trim().length > 0)

  function onSelect(next: string | number | (string | number)[] | null | undefined) {
    const entity = options.value.find(option => option.value === next)?.entity
    if (entity) emit('add', toComposerWork(entity))
  }
</script>

<template>
  <Stack gap="sm" :class="fill ? 'min-h-0 grow' : undefined">
    <SearchInput
      v-model="query"
      autofocus
      clearable
      :size="fill ? 'md' : 'sm'"
      placeholder="搜索 Galgame / 轻小说 / 漫画…"
      :loading="loading"
      class="shrink-0"
    />

    <Stack v-if="loading" gap="sm" :class="fill ? 'min-h-0 grow' : undefined">
      <Skeleton v-for="width in SKELETON_WIDTHS" :key="width" :class="`h-12 rounded-md ${width}`" />
    </Stack>
    <Empty
      v-else-if="searched && !options.length"
      title="没有匹配的作品"
      :class="fill ? 'grow' : undefined"
    />
    <ScrollArea v-else-if="options.length" :class="fill ? 'min-h-0 grow' : 'max-h-72'">
      <Listbox
        :options="options"
        variant="bare"
        :padded="false"
        max-height="none"
        aria-label="关联作品"
        @update:model-value="onSelect"
      >
        <template #option="{ option }">
          <FeedComposerRelatedWorksRow :entity="option.entity" />
        </template>
      </Listbox>
    </ScrollArea>
  </Stack>
</template>
