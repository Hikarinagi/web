<script setup lang="ts">
  import { LoaderCircle } from '@lucide/vue'
  import { useMarqueeSelect } from './composables/useMarqueeSelect'
  import type { MediaValue, PendingUpload } from './types'

  const props = defineProps<{
    items: MediaValue[]
    selected: MediaValue[]
    pending: PendingUpload[]
    loading: boolean
    done: boolean
    multi?: boolean
  }>()
  const emit = defineEmits<{
    toggle: [media: MediaValue]
    remove: [media: MediaValue]
    files: [files: File[]]
    reachEnd: []
    marquee: [items: MediaValue[]]
  }>()

  function selectedIndex(id: number): number {
    return props.selected.findIndex(item => item.id === id)
  }

  const sentinel = useTemplateRef<HTMLElement>('sentinel')
  useIntersectionObserver(sentinel, entries => {
    if (entries.some(entry => entry.isIntersecting)) emit('reachEnd')
  })

  const grid = useTemplateRef<HTMLElement>('grid')
  const { marquee, previewIds, onMouseDown, onClickCapture } = useMarqueeSelect({
    container: grid,
    enabled: () => !!props.multi,
    items: () => props.items,
    onPick: picks => emit('marquee', picks),
  })

  function freezeLeavingSize(el: Element) {
    if (el instanceof HTMLElement) {
      el.style.width = `${el.offsetWidth}px`
      el.style.height = `${el.offsetHeight}px`
    }
  }
</script>

<template>
  <div>
    <div
      ref="grid"
      class="relative grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-3 select-none"
      @mousedown="onMouseDown"
      @click.capture="onClickCapture"
    >
      <TransitionGroup
        tag="div"
        name="media-item"
        class="contents"
        @before-leave="freezeLeavingSize"
      >
        <MediaLibraryUploadZone
          key="upload"
          :uploading="pending.length > 0"
          @files="emit('files', $event)"
        />
        <div
          v-for="item in pending"
          :key="item.id"
          class="relative aspect-square overflow-hidden rounded-lg ring-1 ring-surface-200 dark:ring-surface-700"
        >
          <img :src="item.previewUrl" alt="" class="size-full object-cover" />
          <div class="absolute inset-0 flex items-center justify-center bg-black/30">
            <LoaderCircle class="size-6 animate-spin text-white" />
          </div>
        </div>
        <MediaLibraryTile
          v-for="media in items"
          :key="media.id"
          :media="media"
          :selected="selectedIndex(media.id) >= 0 || previewIds.has(media.id)"
          :order="selectedIndex(media.id) + 1"
          @click="emit('toggle', media)"
          @remove="emit('remove', media)"
        />
      </TransitionGroup>
      <template v-if="loading">
        <Skeleton
          v-for="i in 6"
          :key="`loading-${i}`"
          border-radius="0.5rem"
          class="aspect-square h-auto! w-full!"
        />
      </template>
      <div
        v-if="marquee"
        class="pointer-events-none absolute z-10 rounded border border-primary/60 bg-primary/10"
        :style="{
          left: marquee.x + 'px',
          top: marquee.y + 'px',
          width: marquee.w + 'px',
          height: marquee.h + 'px',
        }"
      />
    </div>
    <div v-if="!done" ref="sentinel" class="h-px" />
  </div>
</template>

<style scoped>
  .media-item-enter-active,
  .media-item-leave-active {
    transition: opacity 200ms ease;
  }
  .media-item-enter-from,
  .media-item-leave-to {
    opacity: 0;
  }
  .media-item-leave-active {
    position: absolute;
  }
  .media-item-move {
    transition: transform 250ms ease;
  }
</style>
