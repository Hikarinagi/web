<script setup lang="ts">
  import { TABLE_CELL_ALIGN_VALUES, type EditorNode } from '@hikarinagi/editor-schema'

  defineOptions({ name: 'HikariContentNodesTableCell' })

  const props = defineProps<{ node: EditorNode }>()

  const tag = computed(() => (props.node.type === 'table_header' ? 'th' : 'td'))

  const span = (key: 'colspan' | 'rowspan') => {
    const value = props.node.attrs?.[key]
    return typeof value === 'number' && value > 1 ? value : undefined
  }

  const colspan = computed(() => span('colspan'))
  const rowspan = computed(() => span('rowspan'))

  const align = computed(() => {
    const value = props.node.attrs?.align
    return TABLE_CELL_ALIGN_VALUES.includes(value as never) ? (value as string) : null
  })
</script>

<template>
  <component
    :is="tag"
    :colspan="colspan"
    :rowspan="rowspan"
    :style="align ? `text-align:${align}` : undefined"
  >
    <HikariContentDispatch v-for="(child, i) in node.content ?? []" :key="i" :node="child" />
  </component>
</template>
