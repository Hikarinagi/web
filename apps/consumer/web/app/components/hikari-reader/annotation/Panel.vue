<script setup lang="ts">
  import { Button, Card, Drawer, Empty, Inline, Stack, Text } from '@hina-ui/vue'
  import { Highlighter, NotebookPen, NotebookText, Trash2, Underline } from '@lucide/vue'
  import type { ReaderAnnotation } from '../composables/useReaderAnnotations'
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

  const { confirm } = useHikariConfirm()

  function confirmRemove(id: string) {
    confirm({
      title: '删除标注',
      description: '确定要删除这条标注吗？',
      confirmText: '删除',
      tone: 'danger',
      onConfirm: () => emit('remove', id),
    })
  }
</script>

<template>
  <Drawer v-model:open="visible" title="标注" side="start" size="md">
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
            <Inline gap="xs" align="center" class="w-full">
              <Highlighter
                v-if="item.kind === 'highlight'"
                class="size-3.5 shrink-0"
                :style="{ color: item.color ?? '#ffeb3b' }"
                aria-hidden="true"
              />
              <Underline
                v-else-if="item.kind === 'underline'"
                class="size-3.5 shrink-0"
                :style="{ color: item.color ?? '#ffeb3b' }"
                aria-hidden="true"
              />
              <NotebookText v-else class="size-3.5 shrink-0 text-accent-text" aria-hidden="true" />
              <Text as="span" size="xs" tone="muted" class="line-clamp-1">
                {{ chapterTitle(item) || '未命名章节' }}
              </Text>
            </Inline>

            <Text
              as="span"
              size="sm"
              class="line-clamp-3 leading-6"
              :class="item.kind !== 'note' ? 'border-l-2 pl-2' : ''"
              :style="{ borderColor: item.color ?? '#ffeb3b' }"
            >
              {{ text(item) || '（无内容）' }}
            </Text>

            <Text v-if="item.note" as="span" size="xs" tone="muted" class="line-clamp-2">
              {{ item.note }}
            </Text>
            <Text as="span" size="xs" tone="faint">
              {{ timeBrief(item.modifiedAt ?? item.createdAt) }}
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
              :aria-label="item.note ? '编辑标注' : '添加标注'"
              @click.stop="emit('edit', item)"
            >
              <template #icon><NotebookPen /></template>
            </Button>
            <Button
              variant="ghost"
              tone="danger"
              size="sm"
              icon-only
              pill
              aria-label="删除标注"
              @click.stop="confirmRemove(item.id)"
            >
              <template #icon><Trash2 /></template>
            </Button>
          </Inline>
        </Card>
      </Stack>

      <Empty v-else title="暂无标注" description="在阅读区域选中文字后可以添加">
        <template #icon><Highlighter /></template>
      </Empty>
    </template>
  </Drawer>
</template>
