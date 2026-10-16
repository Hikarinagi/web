<script setup lang="ts">
  import { Tabs, TabsContent, TabsList, TabsTrigger } from '@hina-ui/vue'
  import {
    chapterCells,
    chapterRanges,
    type ContentsItem,
    type ContentsVariant,
  } from '~/features/manga/contents'

  defineOptions({ name: 'MangaContentsChapterGrid' })

  const props = withDefaults(
    defineProps<{
      chapters: ContentsItem[]
      currentId: number | null
      currentPage?: number
      readIds: ReadonlySet<number>
      signedIn: boolean
      desc?: boolean
      variant?: ContentsVariant
    }>(),
    { currentPage: 0, desc: false, variant: 'page' },
  )
  const emit = defineEmits<{ select: [item: ContentsItem] }>()
  const range = defineModel<string | null>('range', { default: null })

  const ranges = computed(() => {
    const list = chapterRanges(props.chapters)
    return props.desc ? [...list].reverse() : list
  })
  const shown = computed(() =>
    ranges.value.some(entry => entry.key === range.value) ? range.value! : ranges.value[0]?.key,
  )

  function cellsOf(key: string | null) {
    const cells = chapterCells(props.chapters, key)
    return props.desc ? cells.reverse() : cells
  }
</script>

<template>
  <Tabs
    v-if="ranges.length"
    :model-value="shown"
    variant="soft"
    size="sm"
    @update:model-value="range = $event ?? null"
  >
    <TabsList label="区间">
      <TabsTrigger v-for="entry in ranges" :key="entry.key" :value="entry.key" class="tabular-nums">
        {{ entry.label }}
      </TabsTrigger>
    </TabsList>
    <TabsContent v-for="entry in ranges" :key="entry.key" :value="entry.key">
      <MangaContentsChapterCells
        :cells="cellsOf(entry.key)"
        :current-id="currentId"
        :current-page="currentPage"
        :read-ids="readIds"
        :signed-in="signedIn"
        :variant="variant"
        class="pt-4"
        @select="emit('select', $event)"
      />
    </TabsContent>
  </Tabs>
  <MangaContentsChapterCells
    v-else
    :cells="cellsOf(null)"
    :current-id="currentId"
    :current-page="currentPage"
    :read-ids="readIds"
    :signed-in="signedIn"
    :variant="variant"
    @select="emit('select', $event)"
  />
</template>
