<script setup lang="ts">
  import { Empty, Inline, ScrollArea, SearchInput, Skeleton, Stack, Text } from '@hina-ui/vue'
  import type { Editor } from '@tiptap/vue-3'
  import type { Ref } from 'vue'
  import type { EntitySummaries } from '~/components/hikari-content/composables/useContentSummaries'
  import { useEditorOverlays } from '../../composables/useEditorOverlays'
  import { useEditorSummariesMerge } from '../../composables/useEditorSummaries'
  import { insertAfterTable } from '../table/insert'
  import { ENTITY_CARD_META } from './labels'
  import { searchEntities, SEARCH_PAGE_SIZE, type PickedEntity } from './search'
  import type { EntityCardType } from './types'

  const props = defineProps<{
    editor: Editor
    entityType: EntityCardType
    summariesRef: Ref<EntitySummaries>
  }>()

  const { closeOverlay } = useEditorOverlays()
  const { mergeEntity } = useEditorSummariesMerge(props.summariesRef)
  const meta = computed(() => ENTITY_CARD_META[props.entityType])

  const query = ref('')
  const items = ref<PickedEntity[]>([])
  const loading = ref(false)
  const activeIndex = ref(0)

  const browse = computed(
    () =>
      props.entityType === 'galgame_rate' ||
      props.entityType === 'light_novel_rate' ||
      props.entityType === 'manga_rate',
  )

  const state = computed<'idle' | 'loading' | 'results' | 'empty'>(() => {
    if (!browse.value && !query.value.trim()) return 'idle'
    if (loading.value) return 'loading'
    if (items.value.length === 0) return 'empty'
    return 'results'
  })

  const emptyText = computed(() => {
    if (!browse.value) return '未找到，换个关键词试试'
    return query.value.trim() ? '没有匹配的作品' : '你还没有评分过的作品'
  })

  async function runSearch() {
    const kw = query.value.trim()
    if (!browse.value && !kw) {
      items.value = []
      loading.value = false
      return
    }
    try {
      const result = await searchEntities(props.entityType, kw)
      items.value = result.slice(0, SEARCH_PAGE_SIZE)
      activeIndex.value = 0
    } catch {
      items.value = []
    } finally {
      loading.value = false
    }
  }
  const debouncedSearch = useDebounceFn(runSearch, 300)

  watch(query, () => {
    if (browse.value || query.value.trim()) loading.value = true
    void debouncedSearch()
  })

  onMounted(() => {
    if (!browse.value) return
    loading.value = true
    void runSearch()
  })

  function insertNode(nodeType: string, idAttr: string, id: number) {
    const content = [{ type: nodeType, attrs: { [idAttr]: id } }, { type: 'paragraph' }]
    if (insertAfterTable(props.editor, content)) return
    props.editor.chain().focus().insertContent(content).run()
  }

  function insertItem(item: PickedEntity) {
    switch (item.kind) {
      case 'galgame':
        mergeEntity('galgames', item.summary)
        insertNode('galgame_card', 'galgame_id', item.entity_id)
        break
      case 'light_novel':
        mergeEntity('light_novels', item.summary)
        insertNode('light_novel_card', 'light_novel_id', item.entity_id)
        break
      case 'light_novel_volume':
        mergeEntity('light_novel_volumes', item.summary)
        insertNode('light_novel_volume_card', 'light_novel_volume_id', item.entity_id)
        break
      case 'manga':
        mergeEntity('mangas', item.summary)
        insertNode('manga_card', 'manga_id', item.entity_id)
        break
      case 'person':
        mergeEntity('persons', item.summary)
        insertNode('person_card', 'person_id', item.entity_id)
        break
      case 'producer':
        mergeEntity('producers', item.summary)
        insertNode('producer_card', 'producer_id', item.entity_id)
        break
      case 'character':
        mergeEntity('characters', item.summary)
        insertNode('character_card', 'character_id', item.entity_id)
        break
      case 'article':
        mergeEntity('articles', item.summary)
        insertNode('article_card', 'article_id', item.entity_id)
        break
      case 'post':
        mergeEntity('posts', item.summary)
        insertNode('post_card', 'post_id', item.entity_id)
        break
      case 'galgame_rate':
        mergeEntity('galgame_rates', item.summary)
        insertNode('galgame_rate_card', 'galgame_rate_id', item.entity_id)
        break
      case 'light_novel_rate':
        mergeEntity('light_novel_rates', item.summary)
        insertNode('light_novel_rate_card', 'light_novel_rate_id', item.entity_id)
        break
      case 'manga_rate':
        mergeEntity('manga_rates', item.summary)
        insertNode('manga_rate_card', 'manga_rate_id', item.entity_id)
        break
      default: {
        const _exhaustive: never = item
        void _exhaustive
      }
    }
    closeOverlay('entity-card')
  }

  function onKeydown(event: KeyboardEvent) {
    if (state.value !== 'results') {
      if (event.key === 'Escape') closeOverlay('entity-card')
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      activeIndex.value = (activeIndex.value + 1) % items.value.length
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      activeIndex.value = (activeIndex.value - 1 + items.value.length) % items.value.length
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const item = items.value[activeIndex.value]
      if (item) insertItem(item)
    } else if (event.key === 'Escape') {
      closeOverlay('entity-card')
    }
  }
</script>

<template>
  <Stack gap="md">
    <SearchInput
      v-model="query"
      autofocus
      :placeholder="meta.searchPlaceholder"
      class="w-full"
      @keydown="onKeydown"
    />

    <ScrollArea class="min-h-0 grow sm:h-96 sm:grow-0">
      <Empty v-if="state === 'idle'" :description="`输入关键词搜索${meta.label}`" />

      <Empty v-else-if="state === 'empty'" :description="emptyText" />

      <Stack v-else-if="state === 'loading'" gap="xs">
        <Inline v-for="i in 6" :key="i" align="center" gap="md" :wrap="false" class="p-2">
          <Skeleton class="h-16 w-12 shrink-0 rounded" />
          <Stack gap="xs" class="min-w-0 flex-1">
            <Skeleton class="h-4 w-3/5" />
            <Skeleton class="h-3 w-2/5" />
          </Stack>
        </Inline>
      </Stack>

      <Stack v-else gap="xs">
        <Inline
          v-for="(item, idx) in items"
          :key="item.entity_id"
          as="button"
          type="button"
          align="center"
          gap="md"
          :wrap="false"
          :class="
            cn(
              'w-full hn-interactive rounded-lg p-2 text-left hn-press-none',
              idx === activeIndex && 'bg-subtle',
            )
          "
          @click="insertItem(item)"
          @mouseenter="activeIndex = idx"
        >
          <HikariImage
            :src="item.display.cover ?? ''"
            alt=""
            preset="small"
            class="h-16 w-12 shrink-0 overflow-hidden rounded bg-subtle"
            image-class="size-full object-cover"
          >
            <template #empty />
            <template #error />
          </HikariImage>
          <Stack gap="none" class="min-w-0 flex-1">
            <Text weight="medium" truncate>{{ item.display.title }}</Text>
            <Text v-if="item.display.subtitle" size="sm" tone="muted" truncate>
              {{ item.display.subtitle }}
            </Text>
            <Text v-if="item.display.meta" size="xs" tone="faint" truncate>
              {{ item.display.meta }}
            </Text>
          </Stack>
        </Inline>
      </Stack>
    </ScrollArea>
  </Stack>
</template>
