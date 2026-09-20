<script setup lang="ts">
  import { useScroll } from '@vueuse/core'
  import { TABLE_CELL_MIN_WIDTH, type EditorNode } from '@hikarinagi/editor-schema'

  defineOptions({ name: 'HikariContentNodesTableBlock' })

  const props = defineProps<{ node: EditorNode }>()

  const rows = computed(() => (props.node.content ?? []).filter(row => row.type === 'table_row'))

  const columnWidths = computed(() => {
    const first = rows.value[0]
    if (!first) return []
    const widths: (number | null)[] = []
    for (const cell of first.content ?? []) {
      const colspan = typeof cell.attrs?.colspan === 'number' ? cell.attrs.colspan : 1
      const colwidth = Array.isArray(cell.attrs?.colwidth) ? (cell.attrs.colwidth as number[]) : []
      for (let i = 0; i < colspan; i++) {
        const width = colwidth[i]
        widths.push(typeof width === 'number' && width > 0 ? width : null)
      }
    }
    return widths
  })

  const minWidth = computed(() =>
    columnWidths.value.reduce<number>((total, width) => total + (width ?? TABLE_CELL_MIN_WIDTH), 0),
  )

  const headerRow = computed(
    () =>
      rows.value.length > 0 &&
      (rows.value[0]?.content ?? []).every(cell => cell.type === 'table_header'),
  )

  const headerColumn = computed(
    () =>
      rows.value.length > 0 && rows.value.every(row => row.content?.[0]?.type === 'table_header'),
  )

  function colStyle(width: number | null) {
    return width ? { width: `${width}px` } : { minWidth: `${TABLE_CELL_MIN_WIDTH}px` }
  }

  const sentinel = useTemplateRef<HTMLElement>('sentinel')
  const scroller = useTemplateRef<{ viewport: HTMLElement | null }>('scroller')
  const viewport = computed(() => scroller.value?.viewport ?? null)

  const pinned = ref(false)
  useIntersectionObserver(sentinel, ([entry]) => {
    pinned.value = entry?.isIntersecting === false
  })

  const { x } = useScroll(viewport)

  const table = useTemplateRef<HTMLTableElement>('table')
  const head = ref(0)
  const side = ref(0)

  function measure() {
    const row = table.value?.tBodies[0]?.rows[0]
    head.value = headerRow.value ? (row?.offsetHeight ?? 0) : 0
    side.value = headerColumn.value ? (row?.cells[0]?.offsetWidth ?? 0) : 0
  }

  useResizeObserver(table, measure)
  watch([headerRow, headerColumn], measure)

  const frameStyle = computed(() => ({
    '--hikari-table-head-h': `${head.value}px`,
    '--hikari-table-head-w': `${side.value}px`,
  }))
  const tableStyle = computed(() => ({ minWidth: `${minWidth.value}px` }))
  const ghostStyle = computed(() => ({ ...tableStyle.value, marginLeft: `${-x.value}px` }))
</script>

<template>
  <div
    class="tableWrapper"
    :class="{ 'has-header-row': headerRow, 'has-header-column': headerColumn, 'is-pinned': pinned }"
    :style="frameStyle"
  >
    <div ref="sentinel" class="hikari-table-sentinel" />

    <div v-if="headerRow" class="hikari-table-sticky" aria-hidden="true">
      <div class="hikari-table-sticky__clip">
        <table :style="ghostStyle">
          <colgroup>
            <col v-for="(width, i) in columnWidths" :key="i" :style="colStyle(width)" />
          </colgroup>
          <tbody>
            <HikariContentNodesTableRow :node="rows[0]!" />
          </tbody>
        </table>
      </div>
    </div>

    <ScrollArea ref="scroller" axis="both" shadow="both" class="hikari-table-scroll">
      <table ref="table" :style="tableStyle">
        <colgroup>
          <col v-for="(width, i) in columnWidths" :key="i" :style="colStyle(width)" />
        </colgroup>
        <tbody>
          <HikariContentNodesTableRow v-for="(row, i) in rows" :key="i" :node="row" />
        </tbody>
      </table>
    </ScrollArea>
  </div>
</template>
