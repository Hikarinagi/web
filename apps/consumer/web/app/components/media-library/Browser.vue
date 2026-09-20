<script setup lang="ts">
  import { CloudUpload } from '@lucide/vue'
  import { push } from 'notivue'
  import { useMediaCollection } from './composables/useMediaCollection'
  import { useMediaLibrary } from './composables/useMediaLibrary'
  import { uploadImage } from './lib/upload'
  import type { MediaValue, PendingUpload } from './types'

  const { mode, max, finish } = useMediaLibrary()
  const { items, loading, done, loadMore, ensureLoaded, prepend, remove } = useMediaCollection()
  const confirm = useConfirm()

  const selected = ref<MediaValue[]>([])
  const pending = ref<PendingUpload[]>([])
  const dragging = ref(false)
  const deleting = ref(false)
  let pendingSeq = 0

  onMounted(ensureLoaded)

  function toggle(media: MediaValue) {
    const idx = selected.value.findIndex(item => item.id === media.id)
    if (idx >= 0) {
      selected.value = selected.value.filter(item => item.id !== media.id)
      return
    }
    if (mode.value === 'single') {
      selected.value = [media]
      return
    }
    if (max.value != null && selected.value.length >= max.value) {
      push.info({ message: `最多选择 ${max.value} 张` })
      return
    }
    selected.value = [...selected.value, media]
  }

  function marqueeSelect(picks: MediaValue[]) {
    const existing = new Set(selected.value.map(item => item.id))
    const room = max.value == null ? Infinity : max.value - selected.value.length
    const added: MediaValue[] = []
    for (const media of picks) {
      if (existing.has(media.id) || added.length >= room) continue
      added.push(media)
    }
    if (!added.length) return
    selected.value = [...selected.value, ...added]
    if (max.value != null && picks.filter(p => !existing.has(p.id)).length > added.length) {
      push.info({ message: `最多选择 ${max.value} 张` })
    }
  }

  function autoSelect(media: MediaValue) {
    if (mode.value === 'single') {
      selected.value = [media]
    } else if (max.value == null || selected.value.length < max.value) {
      selected.value = [...selected.value, media]
    }
  }

  async function addFiles(files: File[]) {
    const entries: PendingUpload[] = files.map(file => ({
      id: `up-${++pendingSeq}`,
      previewUrl: URL.createObjectURL(file),
    }))
    pending.value = [...pending.value, ...entries]

    await Promise.all(
      files.map(async (file, idx) => {
        const entry = entries[idx]!
        try {
          const media = await uploadImage(file)
          if (media) {
            prepend(media)
            autoSelect(media)
          }
        } finally {
          // 先卸下 <img> 再 revoke,否则可能短暂指向已失效 URL
          pending.value = pending.value.filter(item => item.id !== entry.id)
          await nextTick()
          URL.revokeObjectURL(entry.previewUrl)
        }
      }),
    )
  }

  onBeforeUnmount(() => {
    for (const item of pending.value) URL.revokeObjectURL(item.previewUrl)
  })

  function onDrop(event: DragEvent) {
    dragging.value = false
    const files = Array.from(event.dataTransfer?.files ?? []).filter(file =>
      file.type.startsWith('image/'),
    )
    if (files.length) void addFiles(files)
  }

  const confirmLabel = computed(() =>
    selected.value.length ? `添加 ${selected.value.length} 张` : '添加',
  )

  function requestDelete(media: MediaValue) {
    confirm.require({
      group: 'app-shell',
      header: '从媒体库移除',
      message: '将这张图片从媒体库移除？',
      rejectLabel: '取消',
      acceptLabel: '移除',
      defaultFocus: 'reject',
      loading: () => deleting.value,
      onAccept: ({ close }) => void deleteMedia(media, close),
    })
  }

  async function deleteMedia(media: MediaValue, close: () => void) {
    if (deleting.value) return
    deleting.value = true
    try {
      await hikariRequest('/api/v3/user/me/media/{id}', {
        method: 'DELETE',
        path: { id: media.id },
      })
      remove(media.id)
      selected.value = selected.value.filter(item => item.id !== media.id)
      close()
    } catch {
      /* empty */
    } finally {
      deleting.value = false
    }
  }
</script>

<template>
  <div
    class="flex h-full flex-col md:h-[58vh] md:max-h-128"
    @dragover.prevent="dragging = true"
    @dragleave.prevent="dragging = false"
    @drop.prevent="onDrop"
  >
    <div class="relative min-h-0 flex-1">
      <ScrollArea class="size-full">
        <div class="px-0.5 py-1">
          <MediaLibraryGrid
            :items="items"
            :selected="selected"
            :pending="pending"
            :loading="loading"
            :done="done"
            :multi="mode === 'multiple'"
            @remove="requestDelete"
            @toggle="toggle"
            @marquee="marqueeSelect"
            @files="addFiles"
            @reach-end="loadMore"
          />
        </div>
      </ScrollArea>

      <Transition
        enter-active-class="transition-opacity duration-150"
        leave-active-class="transition-opacity duration-150"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-if="dragging"
          class="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-primary bg-primary/10 text-primary backdrop-blur-sm"
        >
          <CloudUpload class="size-8" />
          <span class="text-sm font-medium">松开以上传</span>
        </div>
      </Transition>
    </div>

    <div class="flex items-center gap-3 border-t border-surface-200 pt-3 dark:border-surface-800">
      <span class="mr-auto text-sm text-muted-color">已选 {{ selected.length }}</span>
      <Button label="取消" variant="text" severity="secondary" @click="finish([])" />
      <Button :label="confirmLabel" :disabled="!selected.length" @click="finish(selected)" />
    </div>
  </div>
</template>
