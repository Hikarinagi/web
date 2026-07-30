<script setup lang="ts">
  import { PenLine } from '@lucide/vue'
  import type { GalgamesPageData } from '~~/server/api/pages/galgames.get'

  defineOptions({ name: 'GalgameExploreHero' })
  const props = defineProps<{
    mosaic: GalgamesPageData['mosaic']
    total: number
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
    if (!width || !height) return `${DESIGN_COLUMN_WIDTH} / 329`

    return `${width} / ${height}`
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
  <section class="relative overflow-hidden bg-white dark:bg-surface-950">
    <div class="absolute inset-0 bg-white dark:bg-surface-950" aria-hidden="true">
      <div
        class="flex h-full min-w-full gap-2 overflow-hidden bg-white blur-[1.5px] dark:bg-surface-950"
      >
        <div
          v-for="(column, columnIndex) in columns"
          :key="`column-${columnIndex}`"
          class="flex h-full w-58.25 shrink-0 flex-col gap-2 overflow-hidden bg-white dark:bg-surface-950"
        >
          <HikariImage
            v-for="item in column"
            :key="item.id"
            :src="item.source"
            :alt="item.alt"
            class="w-full shrink-0 overflow-hidden bg-surface-100 dark:bg-surface-800"
            :style="{ aspectRatio: aspectRatioOf(item) }"
            image-class="size-full object-cover"
            :processing="processingOf(item, 320)"
            :lazy="true"
            :skeleton="false"
          >
            <template #empty><span /></template>
            <template #error><span /></template>
          </HikariImage>
        </div>
      </div>
    </div>
    <div class="absolute inset-0 bg-surface-0/76 dark:bg-surface-950/72" aria-hidden="true" />
    <div
      class="absolute inset-0 bg-[linear-gradient(90deg,var(--p-surface-0)_0%,rgba(255,255,255,0.82)_44%,rgba(255,255,255,0.54)_100%)] dark:bg-[linear-gradient(90deg,var(--p-surface-950)_0%,rgba(3,7,18,0.82)_45%,rgba(3,7,18,0.54)_100%)]"
      aria-hidden="true"
    />

    <div
      class="relative z-10 mx-auto box-content flex min-h-[calc(224px+var(--app-header-height))] max-w-app items-center px-6 pt-[calc(var(--app-header-height)+24px)] pb-12 xl:min-h-[calc(300px+var(--app-header-height))] xl:pb-16"
    >
      <div class="max-w-4xl">
        <!-- <p class="text-xs font-medium tracking-[0.08em] text-surface-400 dark:text-surface-500">
          Hikarinagi数据库已收录 {{ total.toLocaleString() }} 部视觉小说
        </p> -->
        <h1 class="text-[34px] leading-tight font-semibold text-surface-950 dark:text-white">
          我们替你把目光放慢一点———
          <br />
          被认真玩过、认真聊过的那些作品。
        </h1>
        <Button
          login-required
          label="记录进度"
          icon-pos="right"
          size="large"
          class="mt-4"
          @click="recordOpen = true"
        >
          <template #icon>
            <PenLine class="size-4" aria-hidden="true" />
          </template>
        </Button>
      </div>
    </div>
    <GalgameExploreRecordDialog v-model:visible="recordOpen" />
  </section>
</template>
