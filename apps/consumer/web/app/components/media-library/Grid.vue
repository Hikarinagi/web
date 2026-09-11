<script setup lang="ts">
  import { Center, Image, SimpleGrid, Skeleton, Spinner, Stack } from '@hina-ui/vue'
  import type { ComponentPublicInstance } from 'vue'
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
    remove: [items: MediaValue[]]
    download: [items: MediaValue[]]
    copy: [media: MediaValue]
    open: [media: MediaValue]
    files: [files: File[]]
    reachEnd: []
    marquee: [items: MediaValue[]]
  }>()

  function selectedIndex(id: number): number {
    return props.selected.findIndex(item => item.id === id)
  }

  function targetsOf(media: MediaValue): MediaValue[] {
    return selectedIndex(media.id) >= 0 && props.selected.length > 1 ? props.selected : [media]
  }

  const sentinel = useTemplateRef<HTMLElement>('sentinel')
  useIntersectionObserver(sentinel, entries => {
    if (entries.some(entry => entry.isIntersecting)) emit('reachEnd')
  })

  const gridRef = useTemplateRef<ComponentPublicInstance>('grid')
  const grid = computed<HTMLElement | null>(() => (gridRef.value?.$el as HTMLElement) ?? null)
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
  <Stack gap="none">
    <SimpleGrid
      ref="grid"
      min="8rem"
      gap="sm"
      class="relative select-none"
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
        <Center
          v-for="item in pending"
          :key="item.id"
          class="relative aspect-square overflow-hidden rounded-lg ring-1 ring-line"
        >
          <Image :src="item.previewUrl" alt="" fit="cover" :skeleton="false" class="size-full" />
          <Center class="absolute inset-0 bg-black/30">
            <Spinner class="text-white" />
          </Center>
        </Center>
        <MediaLibraryTileMenu
          v-for="media in items"
          :key="media.id"
          :media="media"
          :targets="targetsOf(media)"
          :selected="selectedIndex(media.id) >= 0"
          @toggle="emit('toggle', $event)"
          @open="emit('open', $event)"
          @copy="emit('copy', $event)"
          @download="emit('download', $event)"
          @remove="emit('remove', $event)"
        >
          <MediaLibraryTile
            :media="media"
            :selected="selectedIndex(media.id) >= 0 || previewIds.has(media.id)"
            :order="selectedIndex(media.id) + 1"
            @click="emit('toggle', media)"
            @remove="emit('remove', [media])"
          />
        </MediaLibraryTileMenu>
      </TransitionGroup>
      <template v-if="loading">
        <Skeleton v-for="i in 6" :key="`loading-${i}`" class="aspect-square w-full rounded-lg" />
      </template>
      <Center
        v-if="marquee"
        class="pointer-events-none absolute z-10 rounded border border-accent/60 bg-accent/10"
        :style="{
          left: marquee.x + 'px',
          top: marquee.y + 'px',
          width: marquee.w + 'px',
          height: marquee.h + 'px',
        }"
      />
    </SimpleGrid>
    <div v-if="!done" ref="sentinel" class="h-px" />
  </Stack>
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
