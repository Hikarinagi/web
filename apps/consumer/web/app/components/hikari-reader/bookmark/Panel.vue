<script setup lang="ts">
  import { Button, Card, Drawer, Empty, Inline, Stack, Text } from '@hina-ui/vue'
  import { Bookmark, BookmarkCheck, BookmarkPlus, Pencil, Trash2 } from '@lucide/vue'
  import type { ReaderBookmark } from '../composables/useReaderBookmarks'
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

  const { confirm } = useHikariConfirm()

  function confirmRemove(id: number) {
    confirm({
      title: '删除书签',
      description: '确定要删除这条书签吗？',
      confirmText: '删除',
      tone: 'danger',
      onConfirm: () => emit('remove', id),
    })
  }

  function progressLabel(bookmark: ReaderBookmark) {
    const pos = bookmark.position as { progress?: number } | null
    if (!pos || typeof pos.progress !== 'number') return null
    return `${(pos.progress * 100).toFixed(1)}%`
  }
</script>

<template>
  <Drawer v-model:open="visible" title="书签" side="start" size="md">
    <template #content>
      <Stack v-if="items.length" gap="sm">
        <Card
          v-for="item in items"
          :key="item.id"
          :padded="false"
          class="group px-3 py-2.5 transition-colors hover:border-line-strong"
        >
          <Stack
            as="button"
            type="button"
            gap="xs"
            align="start"
            class="w-full hn-interactive text-start"
            @click="emit('jump', item)"
          >
            <Inline gap="sm" align="baseline" justify="between" class="w-full">
              <Text as="span" size="sm" weight="medium" class="line-clamp-1">
                {{ item.chapter_title || '未命名章节' }}
              </Text>
              <Text
                v-if="progressLabel(item)"
                as="span"
                size="xs"
                tone="muted"
                class="shrink-0 tabular-nums"
              >
                {{ progressLabel(item) }}
              </Text>
            </Inline>
            <Text v-if="item.note" as="span" size="xs" tone="muted" class="line-clamp-2">
              {{ item.note }}
            </Text>
            <Text as="span" size="xs" tone="faint">
              {{ timeBrief(item.modified_at ?? item.created_at) }}
            </Text>
          </Stack>

          <Inline
            gap="xs"
            justify="end"
            class="mt-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100"
          >
            <Button
              variant="ghost"
              tone="neutral"
              size="sm"
              icon-only
              pill
              aria-label="编辑备注"
              @click.stop="emit('edit', item)"
            >
              <template #icon><Pencil /></template>
            </Button>
            <Button
              variant="ghost"
              tone="danger"
              size="sm"
              icon-only
              pill
              aria-label="删除书签"
              @click.stop="confirmRemove(item.id)"
            >
              <template #icon><Trash2 /></template>
            </Button>
          </Inline>
        </Card>
      </Stack>

      <Empty v-else title="暂无书签">
        <template #icon><Bookmark /></template>
        <template #actions>
          <Button size="sm" :disabled="hasCurrent" @click="emit('addCurrent')">
            <template #icon>
              <BookmarkCheck v-if="hasCurrent" />
              <BookmarkPlus v-else />
            </template>
            {{ hasCurrent ? '当前位置已添加' : '添加当前位置' }}
          </Button>
        </template>
      </Empty>
    </template>
  </Drawer>
</template>
