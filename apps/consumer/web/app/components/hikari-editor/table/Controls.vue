<script setup lang="ts">
  import type { Editor } from '@tiptap/vue-3'
  import type { EditorMenuGroup } from '../menu/Floating.vue'
  import {
    alignOf,
    isHeaderLine,
    selectLine,
    setAlign,
    tableAt,
    type TableAxis,
    type TableRef,
  } from './commands'
  import { gripsKey, gripsPlugin, type GripPress } from './grips'
  import {
    DELETE_TABLE_ITEM,
    TABLE_ALIGN_ITEMS,
    cellItems,
    deleteItem,
    headerItem,
    lineItems,
  } from './menu-items'

  defineOptions({ name: 'HikariEditorTableControls' })

  const props = defineProps<{ editor: Editor | null }>()

  const menu = ref<{ axis: TableAxis; index: number } | null>(null)
  const anchor = shallowRef<HTMLElement | null>(null)
  const target = shallowRef<TableRef | null>(null)

  function onPress(press: GripPress) {
    const editor = props.editor
    if (!editor) return
    const table = tableAt(editor, press.pos)
    if (!table || !selectLine(editor, table, press.axis, press.index)) return
    target.value = table
    anchor.value = press.el
    menu.value = { axis: press.axis, index: press.index }
  }

  watch(
    () => props.editor,
    (editor, _prev, onCleanup) => {
      if (!editor) return
      editor.registerPlugin(gripsPlugin(onPress))
      onCleanup(() => editor.unregisterPlugin(gripsKey))
    },
    { immediate: true },
  )

  const placement = computed(() => (menu.value?.axis === 'row' ? 'right' : 'bottom'))

  const menuGroups = computed<EditorMenuGroup[]>(() => {
    const table = target.value
    const at = menu.value
    if (!table || !at) return []

    const current = alignOf(table, at.axis, at.index)
    const groups: EditorMenuGroup[] = [
      { items: lineItems(at.axis) },
      {
        label: '对齐',
        items: TABLE_ALIGN_ITEMS.map(item => ({
          id: item.id,
          icon: item.icon,
          label: item.label,
          checked: item.value === current,
        })),
      },
    ]
    if (at.index === 0) {
      groups.push({ items: [{ ...headerItem(at.axis), checked: isHeaderLine(table, at.axis, 0) }] })
    }
    groups.push({ items: cellItems(props.editor?.can().mergeCells() ?? false) })
    groups.push({ items: [deleteItem(at.axis), DELETE_TABLE_ITEM] })
    return groups
  })

  function onSelect(id: string) {
    const editor = props.editor
    const at = menu.value
    menu.value = null
    if (!editor || !at) return

    const align = TABLE_ALIGN_ITEMS.find(item => item.id === id)
    if (align) {
      setAlign(editor, align.value)
      return
    }

    const column = at.axis === 'column'
    const commands = editor.commands
    switch (id) {
      case 'insert-before':
        if (column) commands.addColumnBefore()
        else commands.addRowBefore()
        break
      case 'insert-after':
        if (column) commands.addColumnAfter()
        else commands.addRowAfter()
        break
      case 'header-row':
        commands.toggleHeaderRow()
        break
      case 'header-column':
        commands.toggleHeaderColumn()
        break
      case 'merge':
        commands.mergeCells()
        break
      case 'split':
        commands.splitCell()
        break
      case 'delete':
        if (column) commands.deleteColumn()
        else commands.deleteRow()
        break
      case 'delete-table':
        commands.deleteTable()
        target.value = null
        break
    }
    editor.view.focus()
  }
</script>

<template>
  <HikariEditorMenuFloating
    :open="menu !== null"
    :anchor="anchor"
    :groups="menuGroups"
    :placement="placement"
    @select="onSelect"
    @close="menu = null"
  />
</template>
