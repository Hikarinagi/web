<script setup lang="ts">
  import { Search } from '@lucide/vue'
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
  <div class="entity-card-popover">
    <div class="entity-card-popover__search">
      <Search class="size-4 shrink-0 text-muted-color" />
      <InputText
        v-model="query"
        autofocus
        fluid
        size="small"
        :placeholder="meta.searchPlaceholder"
        :pt="{ root: { class: 'pl-1! !border-0 !ring-0 !shadow-none !p-0 !bg-transparent' } }"
        @keydown="onKeydown"
      />
    </div>

    <div v-if="state === 'idle'" class="entity-card-popover__hint">
      请输入关键词搜索 {{ meta.label }}
    </div>

    <div v-else-if="state === 'loading'" class="entity-card-popover__list">
      <div v-for="i in 4" :key="i" class="entity-card-popover__row entity-card-popover__row--skel">
        <Skeleton size="40px" />
        <div class="entity-card-popover__row-text">
          <Skeleton height="14px" width="60%" />
          <Skeleton height="12px" width="40%" />
        </div>
      </div>
    </div>

    <div v-else-if="state === 'empty'" class="entity-card-popover__hint">
      {{ emptyText }}
    </div>

    <div v-else class="entity-card-popover__list">
      <Button
        v-for="(item, idx) in items"
        :key="item.entity_id"
        unstyled
        type="button"
        :class="[
          'entity-card-popover__row',
          { 'entity-card-popover__row--active': idx === activeIndex },
        ]"
        @click="insertItem(item)"
        @mouseenter="activeIndex = idx"
      >
        <HikariImage
          :src="item.display.cover ?? ''"
          alt=""
          preset="small"
          class="entity-card-popover__cover"
          image-class="size-full object-cover"
        >
          <template #empty><span /></template>
          <template #error><span /></template>
        </HikariImage>
        <div class="entity-card-popover__row-text">
          <span class="entity-card-popover__title">{{ item.display.title }}</span>
          <span v-if="item.display.subtitle" class="entity-card-popover__subtitle">
            {{ item.display.subtitle }}
          </span>
          <span v-if="item.display.meta" class="entity-card-popover__meta">
            {{ item.display.meta }}
          </span>
        </div>
      </Button>
    </div>
  </div>
</template>

<style scoped>
  .entity-card-popover {
    width: 100%;
    max-height: min(60dvh, 480px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  @media (min-width: 768px) {
    .entity-card-popover {
      width: 480px;
    }
  }
  .entity-card-popover__search {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 4px 10px;
    border-bottom: 1px solid var(--editor-toolbar-border);
  }
  .entity-card-popover__hint {
    padding: 24px;
    text-align: center;
    font-size: 13px;
    color: var(--editor-text-muted);
  }
  .entity-card-popover__hint--small {
    padding: 8px;
    font-size: 12px;
  }
  .entity-card-popover__list {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding-top: 6px;
    overflow-y: auto;
  }
  .entity-card-popover__row {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 8px;
    border-radius: 6px;
    background: transparent;
    text-align: left;
    transition: background 80ms ease-out;
    cursor: pointer;
  }
  .entity-card-popover__row--active {
    background: var(--editor-toolbar-item-hover);
  }
  .entity-card-popover__row--skel {
    cursor: default;
  }
  .entity-card-popover__cover {
    flex: 0 0 40px;
    height: 40px;
    border-radius: 4px;
    overflow: hidden;
    background: var(--editor-toolbar-item-hover);
  }
  .entity-card-popover__row-text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .entity-card-popover__title {
    font-size: 14px;
    font-weight: 500;
    color: var(--editor-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .entity-card-popover__subtitle {
    font-size: 12px;
    color: var(--editor-text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .entity-card-popover__meta {
    font-size: 11px;
    color: var(--editor-text-muted);
  }
</style>
