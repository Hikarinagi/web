<script setup lang="ts">
  import { TableBody, TableCell, TableRow, Text } from '@hina-ui/vue'
  import Sortable from 'sortablejs'
  import type { ComponentPublicInstance } from 'vue'

  defineOptions({ name: 'WikiWorkCastGroup' })

  const props = defineProps<{
    title: string
    ids: number[]
    sortable: boolean
    game: boolean
    columns: number
    flashing: Set<number>
    twinsOf: (id: number) => number[]
  }>()
  const emit = defineEmits<{ reorder: [ids: number[]] }>()

  const body = useTemplateRef<ComponentPublicInstance>('body')
  let instance: Sortable | null = null

  function move(from: number, to: number) {
    const ids = [...props.ids]
    const [moved] = ids.splice(from, 1)
    if (moved === undefined || to < 0 || to > ids.length) return
    ids.splice(to, 0, moved)
    emit('reorder', ids)
  }

  function step(id: number, delta: -1 | 1) {
    const from = props.ids.indexOf(id)
    if (from + delta < 0 || from + delta >= props.ids.length) return
    move(from, from + delta)
    void nextTick(() =>
      document.querySelector<HTMLElement>(`[data-cast="${id}"] [data-drag]`)?.focus(),
    )
  }

  function attach() {
    const el = body.value?.$el as HTMLElement | undefined
    if (!el || instance || !props.sortable) return
    instance = Sortable.create(el, {
      handle: '[data-drag]',
      draggable: '[data-cast]',
      animation: 150,
      ghostClass: 'opacity-40',
      onEnd: ({ item, from, oldIndex, newIndex }) => {
        if (oldIndex == null || newIndex == null || oldIndex === newIndex) return
        from.removeChild(item)
        from.insertBefore(item, from.children[oldIndex] ?? null)
        move(oldIndex, newIndex)
      },
    })
  }

  function detach() {
    instance?.destroy()
    instance = null
  }

  onMounted(attach)
  onBeforeUnmount(detach)
  watch(
    () => props.sortable,
    on => {
      detach()
      if (on) attach()
    },
  )
</script>

<template>
  <TableBody>
    <TableRow class="bg-subtle hover:bg-subtle">
      <TableCell :colspan="columns" class="py-1.5">
        <Text size="xs" weight="medium" tone="muted">{{ title }} {{ ids.length }}</Text>
      </TableCell>
    </TableRow>
  </TableBody>
  <TableBody ref="body">
    <WikiWorkCastRow
      v-for="(id, index) in ids"
      :key="id"
      :appearance="id"
      :twins="twinsOf(id)"
      :position="index + 1"
      :sortable="sortable"
      :game="game"
      :flash="flashing.has(id)"
      @step="delta => step(id, delta)"
    />
  </TableBody>
</template>
