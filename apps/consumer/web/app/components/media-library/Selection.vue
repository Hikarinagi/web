<script setup lang="ts">
  import { GripVertical, X } from '@lucide/vue'
  import type { ClassValue } from 'clsx'
  import Sortable from 'sortablejs'
  import { cn } from '~/utils/cn'
  import type { MediaValue } from './types'

  defineOptions({ inheritAttrs: false })

  const props = withDefaults(
    defineProps<{
      sortable?: boolean
      removable?: boolean
      disabled?: boolean
    }>(),
    { sortable: false, removable: true, disabled: false },
  )
  const model = defineModel<MediaValue[]>({ default: () => [] })
  const attrs = useAttrs()

  defineSlots<{
    overlay?: (props: { media: MediaValue; index: number }) => unknown
    add?: () => unknown
  }>()

  function remove(id: number) {
    if (props.disabled) return
    model.value = model.value.filter(m => m.id !== id)
  }

  const grid = useTemplateRef<HTMLElement>('grid')
  let sortableInstance: Sortable | null = null

  function attachSortable() {
    if (!grid.value || sortableInstance || !props.sortable || props.disabled) return
    sortableInstance = Sortable.create(grid.value, {
      handle: '.media-drag-handle',
      animation: 150,
      draggable: '[data-media-tile]',
      ghostClass: 'opacity-40',
      onEnd: event => {
        if (event.oldIndex == null || event.newIndex == null || event.oldIndex === event.newIndex)
          return
        const next = [...model.value]
        const [moved] = next.splice(event.oldIndex, 1)
        if (!moved) return
        next.splice(event.newIndex, 0, moved)
        model.value = next
      },
    })
  }

  function detachSortable() {
    sortableInstance?.destroy()
    sortableInstance = null
  }

  onMounted(attachSortable)
  onBeforeUnmount(detachSortable)
  watch(
    () => [props.sortable, props.disabled],
    ([s, d]) => {
      detachSortable()
      if (s && !d) attachSortable()
    },
  )
</script>

<template>
  <div
    ref="grid"
    :class="
      cn(
        'grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(10rem,1fr))]',
        attrs.class as ClassValue,
      )
    "
  >
    <div
      v-for="(media, index) in model"
      :key="media.id"
      data-media-tile
      class="group relative aspect-square w-full overflow-hidden rounded-lg border border-surface-200 dark:border-surface-700"
    >
      <HikariImage
        :src="media.src"
        alt=""
        preset="small"
        class="size-full"
        image-class="size-full object-cover"
        preview
      >
        <template #empty><span /></template>
        <template #error><span /></template>
      </HikariImage>

      <div v-if="sortable && !disabled" class="absolute top-1.5 left-1.5">
        <Button
          unstyled
          class="media-drag-handle flex size-6 cursor-grab items-center justify-center rounded-full bg-surface-900/60 text-white opacity-100 transition-opacity active:cursor-grabbing md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
          aria-label="拖动排序"
        >
          <template #icon>
            <GripVertical :size="14" />
          </template>
        </Button>
      </div>

      <div v-if="removable && !disabled" class="absolute top-1.5 right-1.5">
        <Button
          unstyled
          class="flex size-6 items-center justify-center rounded-full bg-surface-900/60 text-white opacity-100 transition-opacity hover:bg-red-500 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
          aria-label="移除"
          @click="remove(media.id)"
        >
          <template #icon>
            <X :size="14" />
          </template>
        </Button>
      </div>

      <slot name="overlay" :media="media" :index="index" />
    </div>
    <slot name="add" />
  </div>
</template>
