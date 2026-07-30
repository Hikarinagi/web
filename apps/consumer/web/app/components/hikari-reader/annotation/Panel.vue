<script setup lang="ts">
  import { Highlighter, NotebookPen, NotebookText, Trash2, Underline } from '@lucide/vue'
  import type { ReaderAnnotation } from '../composables/useReaderAnnotations'
  import { cn } from '~/utils/cn'
  import { timeBrief } from '#imports'

  defineOptions({ name: 'HikariReaderAnnotationPanel' })

  defineProps<{
    items: readonly ReaderAnnotation[]
    chapterTitle: (record: ReaderAnnotation) => string | null
    text: (record: ReaderAnnotation) => string
  }>()

  const visible = defineModel<boolean>('visible', { required: true })
  const emit = defineEmits<{
    jump: [record: ReaderAnnotation]
    edit: [record: ReaderAnnotation]
    remove: [id: string]
  }>()

  const confirm = useConfirm()

  function confirmRemove(id: string) {
    confirm.require({
      group: 'app-shell',
      header: '删除标注',
      message: '确定要删除这条标注吗？',
      rejectLabel: '取消',
      acceptLabel: '删除',
      defaultFocus: 'reject',
      accept: () => emit('remove', id),
    })
  }
</script>

<template>
  <Drawer v-model:visible="visible" position="left" class="w-full! max-w-100!">
    <template #header>
      <div class="flex items-center gap-2">
        <h2 class="text-base font-semibold">标注</h2>
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
          class="flex w-full flex-col items-start gap-1.5 text-left"
          @click="emit('jump', item)"
        >
          <div class="flex w-full items-center gap-1.5">
            <Highlighter
              v-if="item.kind === 'highlight'"
              :size="13"
              class="shrink-0"
              :style="{ color: item.color ?? '#ffeb3b' }"
              aria-hidden="true"
            />
            <Underline
              v-else-if="item.kind === 'underline'"
              :size="13"
              class="shrink-0"
              :style="{ color: item.color ?? '#ffeb3b' }"
              aria-hidden="true"
            />
            <NotebookText v-else :size="13" class="shrink-0 text-primary" aria-hidden="true" />
            <span class="line-clamp-1 text-xs text-muted-color">
              {{ chapterTitle(item) || '未命名章节' }}
            </span>
          </div>
          <span
            class="line-clamp-3 text-sm leading-6"
            :class="item.kind !== 'note' ? 'border-l-2 pl-2' : ''"
            :style="{ borderColor: item.color ?? '#ffeb3b' }"
          >
            {{ text(item) || '（无内容）' }}
          </span>
          <span v-if="item.note" class="line-clamp-2 text-xs leading-5 text-muted-color">
            {{ item.note }}
          </span>
          <span class="text-[11px] text-muted-color">
            {{ timeBrief(item.modifiedAt ?? item.createdAt) }}
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
            :aria-label="item.note ? '编辑标注' : '添加标注'"
            @click.stop="emit('edit', item)"
          >
            <template #icon>
              <NotebookPen :size="14" aria-hidden="true" />
            </template>
          </Button>
          <Button
            severity="danger"
            variant="text"
            size="small"
            rounded
            aria-label="删除标注"
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
      class="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center text-sm text-muted-color"
    >
      <Highlighter :size="28" class="opacity-40" aria-hidden="true" />
      <p>暂无标注</p>
      <p class="text-xs">在阅读区域选中文字后可以添加</p>
    </div>
  </Drawer>
</template>
