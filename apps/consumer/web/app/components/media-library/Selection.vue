<script setup lang="ts">
  import { Button, Center, SimpleGrid } from '@hina-ui/vue'
  import { GripVertical, X } from '@lucide/vue'
  import type { ClassValue } from 'clsx'
  import type { ComponentPublicInstance } from 'vue'
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

  const gridRef = useTemplateRef<ComponentPublicInstance>('grid')
  let sortableInstance: Sortable | null = null

  function attachSortable() {
    const el = gridRef.value?.$el as HTMLElement | undefined
    if (!el || sortableInstance || !props.sortable || props.disabled) return
    sortableInstance = Sortable.create(el, {
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
  <SimpleGrid ref="grid" min="10rem" gap="sm" :class="cn(attrs.class as ClassValue)">
    <Center
      v-for="(media, index) in model"
      :key="media.id"
      data-media-tile
      class="group relative aspect-square w-full overflow-hidden rounded-lg border border-line"
    >
      <HikariImage
        :src="media"
        :alt="`已选图片 ${index + 1}`"
        preset="small"
        class="size-full"
        image-class="size-full object-cover"
        preview
      >
        <template #empty />
        <template #error />
      </HikariImage>

      <Button
        v-if="sortable && !disabled"
        variant="solid"
        tone="neutral"
        size="sm"
        icon-only
        pill
        aria-label="拖动排序"
        class="media-drag-handle absolute top-1.5 left-1.5 size-6 cursor-grab active:cursor-grabbing md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
      >
        <template #icon><GripVertical class="size-3.5" /></template>
      </Button>

      <Button
        v-if="removable && !disabled"
        variant="solid"
        tone="danger"
        size="sm"
        icon-only
        pill
        aria-label="移除"
        class="absolute top-1.5 right-1.5 size-6 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
        @click="remove(media.id)"
      >
        <template #icon><X class="size-3.5" /></template>
      </Button>

      <slot name="overlay" :media="media" :index="index" />
    </Center>
    <slot name="add" />
  </SimpleGrid>
</template>
