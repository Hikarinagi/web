<script setup lang="ts">
  import { Button, Center, Inline, ScrollArea, Stack, Text } from '@hina-ui/vue'
  import { CloudUpload } from '@lucide/vue'
  import { push } from 'notivue'
  import { useMediaCollection } from './composables/useMediaCollection'
  import { useMediaLibrary } from './composables/useMediaLibrary'
  import { downloadMedia } from './lib/download'
  import { uploadImage } from './lib/upload'
  import { resolveImageUrl } from '~/utils/media/image'
  import type { MediaValue, PendingUpload } from './types'

  const { mode, max, finish } = useMediaLibrary()
  const { items, loading, done, loadMore, ensureLoaded, prepend, remove } = useMediaCollection()
  const { confirm } = useHikariConfirm()
  const config = useRuntimeConfig()
  const { copy } = useClipboard()

  const selected = ref<MediaValue[]>([])
  const pending = ref<PendingUpload[]>([])
  const dragging = ref(false)
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

  function mediaUrl(media: MediaValue) {
    return resolveImageUrl(media.src, {
      cdnHost: config.public.cdnHost,
      imageProcessorHost: config.public.imageProcessorHost,
      processing: false,
    })
  }

  function openOriginal(media: MediaValue) {
    window.open(mediaUrl(media), '_blank', 'noopener')
  }

  async function copyLink(media: MediaValue) {
    await copy(mediaUrl(media))
    push.success({ message: '链接已复制' })
  }

  function requestDelete(items: MediaValue[]) {
    if (!items.length) return
    confirm({
      title: items.length > 1 ? `从媒体库移除 ${items.length} 张` : '从媒体库移除',
      description: items.length > 1 ? '将这些图片从媒体库移除？' : '将这张图片从媒体库移除？',
      confirmText: '移除',
      tone: 'danger',
      onConfirm: () => deleteMedia(items),
    })
  }

  async function deleteMedia(items: MediaValue[]) {
    for (const media of items) {
      await hikariRequest('/api/v3/user/me/media/{id}', {
        method: 'DELETE',
        path: { id: media.id },
      })
      remove(media.id)
      selected.value = selected.value.filter(item => item.id !== media.id)
    }
  }
</script>

<template>
  <Stack
    gap="none"
    class="h-full md:h-[58vh] md:max-h-128"
    @dragover.prevent="dragging = true"
    @dragleave.prevent="dragging = false"
    @drop.prevent="onDrop"
  >
    <Stack gap="none" class="relative min-h-0 flex-1">
      <ScrollArea class="size-full">
        <Stack gap="none" class="px-0.5 py-1">
          <MediaLibraryGrid
            :items="items"
            :selected="selected"
            :pending="pending"
            :loading="loading"
            :done="done"
            :multi="mode === 'multiple'"
            @remove="requestDelete"
            @download="items => downloadMedia(items, mediaUrl)"
            @copy="copyLink"
            @open="openOriginal"
            @toggle="toggle"
            @marquee="marqueeSelect"
            @files="addFiles"
            @reach-end="loadMore"
          />
        </Stack>
      </ScrollArea>

      <Transition
        enter-active-class="transition-opacity duration-150"
        leave-active-class="transition-opacity duration-150"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <Center
          v-if="dragging"
          class="pointer-events-none absolute inset-0 z-10 rounded-lg border-2 border-dashed border-accent bg-accent/10 text-accent-text backdrop-blur-sm"
        >
          <Stack gap="sm" align="center">
            <CloudUpload class="size-8" aria-hidden="true" />
            <Text as="span" size="sm" weight="medium">松开以上传</Text>
          </Stack>
        </Center>
      </Transition>
    </Stack>

    <Inline gap="sm" align="center" class="border-t border-line pt-3">
      <Text as="span" size="sm" tone="muted" class="me-auto">已选 {{ selected.length }}</Text>
      <Button variant="ghost" tone="neutral" @click="finish([])">取消</Button>
      <Button :disabled="!selected.length" @click="finish(selected)">{{ confirmLabel }}</Button>
    </Inline>
  </Stack>
</template>
