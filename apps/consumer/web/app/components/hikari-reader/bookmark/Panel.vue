<script setup lang="ts">
  import { Bookmark, BookmarkCheck, BookmarkPlus, Pencil, Trash2 } from '@lucide/vue'
  import type { ReaderBookmark } from '../composables/useReaderBookmarks'
  import { cn } from '~/utils/cn'
  import { timeBrief } from '#imports'

  defineOptions({ name: 'HikariReaderBookmarkPanel' })

  defineProps<{
    items: readonly ReaderBookmark[]
    hasCurrent: boolean
  }>()
  const visible = defineModel<boolean>('visible', { required: true })
  const emit = defineEmits<{
    jump: [bookmark: ReaderBookmark]
    edit: [bookmark: ReaderBookmark]
    remove: [id: number]
    addCurrent: []
  }>()

  const confirm = useConfirm()

  function confirmRemove(id: number) {
    confirm.require({
      group: 'app-shell',
      header: '删除书签',
      message: '确定要删除这条书签吗？',
      rejectLabel: '取消',
      acceptLabel: '删除',
      defaultFocus: 'reject',
      accept: () => emit('remove', id),
    })
  }

  function progressLabel(bookmark: ReaderBookmark) {
    const pos = bookmark.position as { progress?: number } | null
    if (!pos || typeof pos.progress !== 'number') return null
    return `${(pos.progress * 100).toFixed(1)}%`
  }
</script>

<template>
  <Drawer v-model:visible="visible" position="left" class="w-full! max-w-100!">
    <template #header>
      <div class="flex items-center gap-2">
        <h2 class="text-base font-semibold">书签</h2>
        <span v-if="items.length" class="text-xs text-muted-color">{{ items.length }}</span>
      </div>
    </template>

    <div v-if="items.length" class="flex flex-col gap-1.5">
      <div
        v-for="item in items"
        :key="item.id"
        :class="
          cn(
            'group rounded-md border border-surface-200 px-3 py-2.5',
            'hover:border-primary/50 dark:border-surface-700',
            'transition-colors',
          )
        "
      >
        <Button
          unstyled
          type="button"
          class="flex w-full flex-col items-start gap-1 text-left"
          @click="emit('jump', item)"
        >
          <div class="flex w-full items-baseline justify-between gap-2">
            <span class="line-clamp-1 text-sm font-medium">
              {{ item.chapter_title || '未命名章节' }}
            </span>
            <span
              v-if="progressLabel(item)"
              class="shrink-0 text-[11px] text-muted-color tabular-nums"
            >
              {{ progressLabel(item) }}
            </span>
          </div>
          <span v-if="item.note" class="line-clamp-2 text-xs leading-5 text-muted-color">
            {{ item.note }}
          </span>
          <span class="text-[11px] text-muted-color">
            {{ timeBrief(item.modified_at ?? item.created_at) }}
          </span>
        </Button>

        <div
          class="mt-1 flex items-center justify-end gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100"
        >
          <Button
            severity="secondary"
            variant="text"
            size="small"
            rounded
            aria-label="编辑备注"
            @click.stop="emit('edit', item)"
          >
            <template #icon>
              <Pencil :size="14" aria-hidden="true" />
            </template>
          </Button>
          <Button
            severity="danger"
            variant="text"
            size="small"
            rounded
            aria-label="删除书签"
            @click.stop="confirmRemove(item.id)"
          >
            <template #icon>
              <Trash2 :size="14" aria-hidden="true" />
            </template>
          </Button>
        </div>
      </div>
    </div>

    <div
      v-else
      class="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center text-sm text-muted-color"
    >
      <Bookmark :size="28" class="opacity-40" aria-hidden="true" />
      <p>暂无书签</p>
      <Button
        :label="hasCurrent ? '当前位置已添加' : '添加当前位置'"
        size="small"
        :disabled="hasCurrent"
        @click="emit('addCurrent')"
      >
        <template #icon>
          <BookmarkCheck v-if="hasCurrent" :size="14" aria-hidden="true" />
          <BookmarkPlus v-else :size="14" aria-hidden="true" />
        </template>
      </Button>
    </div>
  </Drawer>
</template>
