<script setup lang="ts">
  import {
    Card,
    Chip,
    Empty,
    Inline,
    Popover,
    Ripple,
    ScrollArea,
    SearchInput,
    Skeleton,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import { AnimatePresence, motion } from 'motion-v'
  import { BookMarked } from '@lucide/vue'
  import { TRANSITION } from '~/lib/motion'
  import { RESOURCE_TYPE_ICON } from '~/features/creator/labels'
  import type { ComposerWork } from './composables/useComposer'
  import { searchEntities } from '~/components/hikari-editor/plugins/entity-card/search'

  defineOptions({ name: 'FeedComposerRelatedWorks' })

  const props = defineProps<{ show: boolean; works: ComposerWork[]; full: boolean }>()
  defineEmits<{ add: [work: ComposerWork]; remove: [work: ComposerWork] }>()

  const pickerOpen = ref(false)
  const query = ref('')
  const suggestions = ref<ComposerWork[]>([])
  const loading = ref(false)
  const SKELETON_WIDTHS = ['70%', '55%', '80%', '60%']

  watch(pickerOpen, open => {
    if (!open) query.value = ''
  })

  const runSearch = useDebounceFn(async (keyword: string) => {
    if (!keyword) {
      suggestions.value = []
      loading.value = false
      return
    }
    const [galgames, lightNovels, mangas] = await Promise.all([
      searchEntities('galgame', keyword),
      searchEntities('light_novel', keyword),
      searchEntities('manga', keyword),
    ])
    const selected = new Set(props.works.map(w => `${w.work_type}:${w.id}`))
    suggestions.value = [...galgames, ...lightNovels, ...mangas]
      .map((entity): ComposerWork => ({
        work_type:
          entity.kind === 'galgame'
            ? 'GALGAME'
            : entity.kind === 'light_novel'
              ? 'LIGHT_NOVEL'
              : 'MANGA',
        id: entity.entity_id,
        title: entity.display.title,
      }))
      .filter(work => !selected.has(`${work.work_type}:${work.id}`))
    loading.value = false
  }, 300)

  watch(query, value => {
    const keyword = value.trim()
    loading.value = keyword.length > 0
    void runSearch(keyword)
  })

  const typeLabel = (work: ComposerWork) =>
    work.work_type === 'GALGAME' ? 'Galgame' : work.work_type === 'LIGHT_NOVEL' ? '轻小说' : '漫画'
</script>

<template>
  <AnimatePresence>
    <motion.div
      v-if="show"
      key="related-works"
      :initial="{ height: 0, opacity: 0 }"
      :animate="{ height: 'auto', opacity: 1 }"
      :exit="{ height: 0, opacity: 0 }"
      :transition="TRANSITION"
      class="overflow-hidden"
    >
      <Inline gap="sm" class="px-4 pt-1 pb-2 pl-16">
        <Chip
          v-for="work in works"
          :key="`${work.work_type}:${work.id}`"
          size="sm"
          removable
          :aria-label="`${typeLabel(work)}：${work.title}`"
          @remove="$emit('remove', work)"
        >
          <template #icon>
            <component :is="RESOURCE_TYPE_ICON[work.work_type]" />
          </template>
          <Text as="span" size="xs" truncate>{{ work.title }}</Text>
        </Chip>

        <Popover v-if="!full" v-model:open="pickerOpen" :padded="false" class="w-72 p-1.5">
          <Chip as="button" variant="outline" size="sm" class="border-dashed text-muted">
            <template #icon><BookMarked /></template>
            关联作品
          </Chip>

          <template #content>
            <SearchInput
              v-model="query"
              placeholder="搜索 Galgame / 轻小说 / 漫画…"
              size="sm"
              :loading="loading"
            />
            <ScrollArea v-if="loading || query.trim()" class="mt-2 max-h-64">
              <Stack v-if="loading" gap="sm" class="px-1 py-1">
                <Skeleton
                  v-for="(w, i) in SKELETON_WIDTHS"
                  :key="i"
                  class="h-6 rounded-md"
                  :style="{ width: w }"
                />
              </Stack>
              <template v-else>
                <Card
                  v-for="work in suggestions"
                  :key="`${work.work_type}:${work.id}`"
                  as="button"
                  :padded="false"
                  class="hn-state-layer flex w-full hn-interactive items-center gap-2 rounded-md border-0 bg-transparent px-2 py-1.5 text-left shadow-none hn-press-none"
                  :aria-label="`${typeLabel(work)}：${work.title}`"
                  @click="$emit('add', work)"
                >
                  <Ripple />
                  <component
                    :is="RESOURCE_TYPE_ICON[work.work_type]"
                    class="size-4 shrink-0 text-muted"
                    aria-hidden="true"
                  />
                  <Text as="span" size="sm" truncate class="min-w-0 flex-1">
                    {{ work.title }}
                  </Text>
                </Card>
                <Empty v-if="query.trim() && !suggestions.length" title="没有匹配的作品" />
              </template>
            </ScrollArea>
          </template>
        </Popover>
      </Inline>
    </motion.div>
  </AnimatePresence>
</template>
