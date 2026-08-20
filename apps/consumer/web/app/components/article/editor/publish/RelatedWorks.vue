<script setup lang="ts">
  import { BookMarked, X } from '@lucide/vue'
  import type Popover from 'primevue/popover'
  import { searchEntities } from '~/components/hikari-editor/plugins/entity-card/search'
  import type { ArticleWork } from '../composables/useArticleEditor'

  defineOptions({ name: 'ArticleEditorPublishRelatedWorks' })

  const props = defineProps<{ works: ArticleWork[]; full: boolean }>()
  const emit = defineEmits<{ add: [work: ArticleWork]; remove: [work: ArticleWork] }>()

  const op = ref<InstanceType<typeof Popover>>()
  const query = ref('')
  const suggestions = ref<ArticleWork[]>([])
  const loading = ref(false)
  const SKELETON_WIDTHS = ['70%', '55%', '80%', '60%']

  function toggle(event: MouseEvent) {
    op.value?.toggle(event)
  }

  const runSearch = useDebounceFn(async (keyword: string) => {
    if (!keyword) {
      suggestions.value = []
      loading.value = false
      return
    }
    const [galgames, lightNovels] = await Promise.all([
      searchEntities('galgame', keyword),
      searchEntities('light_novel', keyword),
    ])
    const selected = new Set(props.works.map(w => `${w.work_type}:${w.id}`))
    suggestions.value = [...galgames, ...lightNovels]
      .map(
        (entity): ArticleWork => ({
          work_type: entity.kind === 'galgame' ? 'GALGAME' : 'LIGHT_NOVEL',
          id: entity.entity_id,
          title: entity.display.title,
        }),
      )
      .filter(work => !selected.has(`${work.work_type}:${work.id}`))
    loading.value = false
  }, 300)

  watch(query, value => {
    const keyword = value.trim()
    loading.value = keyword.length > 0
    void runSearch(keyword)
  })

  const typeLabel = (work: ArticleWork) => (work.work_type === 'GALGAME' ? 'Galgame' : '轻小说')
</script>

<template>
  <span
    v-for="work in works"
    :key="`${work.work_type}:${work.id}`"
    class="inline-flex items-center gap-1.5 rounded-lg bg-surface-100 py-1 pr-1.5 pl-2.5 text-xs font-medium text-color dark:bg-surface-800"
  >
    <span class="text-[10px] text-muted-color">{{ typeLabel(work) }}</span>
    {{ work.title }}
    <Button
      unstyled
      aria-label="移除作品"
      class="grid size-4 cursor-pointer place-items-center rounded text-muted-color transition-colors hover:bg-surface-200 hover:text-color dark:hover:bg-surface-700"
      @click="emit('remove', work)"
    >
      <template #icon>
        <X :size="11" />
      </template>
    </Button>
  </span>
  <Button
    v-if="!full"
    label="关联作品"
    unstyled
    class="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-dashed border-surface-300 px-2.5 py-0.5 text-xs font-medium text-muted-color transition-colors hover:border-primary-400 hover:text-primary-600 dark:border-surface-600"
    @click="toggle"
  >
    <template #icon>
      <BookMarked :size="12" />
    </template>
  </Button>
  <Popover ref="op" :pt="{ root: { class: 'popover-no-arrow' } }" @hide="query = ''">
    <div class="w-72">
      <InputText
        v-model="query"
        placeholder="搜索 Galgame / 轻小说…"
        size="small"
        fluid
        autofocus
      />
      <div v-if="loading || query.trim()" class="mt-2 max-h-64 overflow-y-auto">
        <div v-if="loading" class="flex flex-col gap-2 px-1 py-1">
          <Skeleton
            v-for="(w, i) in SKELETON_WIDTHS"
            :key="i"
            height="1.5rem"
            :width="w"
            border-radius="0.375rem"
          />
        </div>
        <template v-else>
          <Button
            v-for="work in suggestions"
            :key="`${work.work_type}:${work.id}`"
            unstyled
            class="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-surface-100 dark:hover:bg-surface-800"
            @click="emit('add', work)"
          >
            <span
              class="shrink-0 rounded bg-surface-100 px-1 py-0.5 text-[10px] text-muted-color dark:bg-surface-700"
            >
              {{ typeLabel(work) }}
            </span>
            <span class="truncate">{{ work.title }}</span>
          </Button>
          <p
            v-if="query.trim() && !suggestions.length"
            class="px-2 py-3 text-center text-xs text-muted-color"
          >
            没有匹配的作品
          </p>
        </template>
      </div>
    </div>
  </Popover>
</template>
