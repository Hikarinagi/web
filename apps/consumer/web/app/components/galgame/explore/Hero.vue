<script setup lang="ts">
  import { Heading, Inline, Stack, VisuallyHidden } from '@hina-ui/vue'
  import { PenLine } from '@lucide/vue'
  import type { GalgamesPageData } from '~~/server/api/pages/galgames.get'

  defineOptions({ name: 'GalgameExploreHero' })
  const props = defineProps<{
    mosaic: GalgamesPageData['mosaic']
  }>()

  type MosaicItem = GalgamesPageData['mosaic'][number]

  const DESIGN_COLUMN_WIDTH = 233
  const MAX_HERO_HEIGHT = 500
  const COLUMN_GAP = 8
  const DEFAULT_COVER_RATIO = 329 / DESIGN_COLUMN_WIDTH
  const COLUMN_FILL_RATIO = MAX_HERO_HEIGHT / DESIGN_COLUMN_WIDTH
  const COLUMN_GAP_RATIO = COLUMN_GAP / DESIGN_COLUMN_WIDTH

  const columns = computed(() => columnsOf(props.mosaic))
  const recordOpen = ref(false)

  function columnsOf(items: MosaicItem[]) {
    const columns: MosaicItem[][] = []
    let column: MosaicItem[] = []
    let columnHeight = 0

    for (const item of items) {
      columnHeight += ratioOf(item) + (column.length > 0 ? COLUMN_GAP_RATIO : 0)
      column.push(item)

      if (columnHeight < COLUMN_FILL_RATIO) continue

      columns.push(column)
      column = []
      columnHeight = 0
    }

    if (column.length > 0 && columns.length === 0) columns.push(column)

    return columns
  }

  function aspectRatioOf(item: MosaicItem) {
    const { width, height } = item
    if (!width || !height) return DESIGN_COLUMN_WIDTH / 329

    return width / height
  }

  function processingOf(item: MosaicItem, width: number) {
    const height = Math.round(width * ratioOf(item))

    return { width, height, quality: 82, fit: 'cover' as const }
  }

  function ratioOf(item: MosaicItem) {
    if (!item.width || !item.height) return DEFAULT_COVER_RATIO

    return item.height / item.width
  }
</script>

<template>
  <Stack as="section" gap="none" class="relative overflow-hidden bg-surface">
    <Stack gap="none" aria-hidden="true" class="absolute inset-0 bg-surface">
      <Inline gap="sm" :wrap="false" class="h-full min-w-full overflow-hidden blur-hikari-3xs">
        <Stack
          v-for="(column, columnIndex) in columns"
          :key="`column-${columnIndex}`"
          gap="sm"
          class="h-full w-58.25 shrink-0 overflow-hidden bg-surface"
        >
          <HikariImage
            v-for="item in column"
            :key="item.id"
            :src="item.source"
            :alt="item.alt"
            class="w-full shrink-0 overflow-hidden bg-subtle"
            :ratio="aspectRatioOf(item)"
            image-class="size-full object-cover"
            :processing="processingOf(item, 320)"
            :lazy="true"
            :skeleton="false"
          >
            <template #empty><VisuallyHidden /></template>
            <template #error><VisuallyHidden /></template>
          </HikariImage>
        </Stack>
      </Inline>
    </Stack>
    <Stack gap="none" aria-hidden="true" class="absolute inset-0 bg-(image:--hikari-veil-side)" />

    <Inline
      gap="none"
      align="center"
      :wrap="false"
      class="relative z-10 box-content min-h-[calc(112px+var(--app-header-height))] px-6 pt-[calc(var(--app-header-height)+16px)] pb-6 xl:min-h-[calc(140px+var(--app-header-height))] xl:pb-7"
    >
      <Stack gap="none" class="mx-auto w-full max-w-app">
        <Stack gap="none" align="start" class="max-w-4xl gap-3">
          <Heading :level="1" size="2xl" class="leading-tight">
            在 Hikarinagi 记录你的游戏状态
          </Heading>
          <Button login-required @click="recordOpen = true">
            记录状态
            <template #trailing><PenLine /></template>
          </Button>
        </Stack>
      </Stack>
    </Inline>
    <GalgameExploreRecordDialog v-model:visible="recordOpen" />
  </Stack>
</template>
