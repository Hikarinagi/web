<script setup lang="ts">
  import {
    Button,
    Card,
    FileUpload,
    IconButton,
    Inline,
    ScrollArea,
    SegmentedControl,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import { CircleHelp, History, Trash2 } from '@lucide/vue'
  import { useDeskSize } from '~/features/contribute/useDeskSize'
  import { useNovelIntake } from '~/features/contribute/useNovelIntake'
  import Entry from './Entry.vue'

  defineProps<{ dragging: boolean }>()
  const emit = defineEmits<{ selected: [value: boolean]; help: []; history: [] }>()

  const PAPER = [
    'scheme-light max-h-(--contribute-queue-height) rounded-xs border-contribute-paper-edge bg-contribute-paper text-contribute-ink shadow-contribute-paper!',
    'transition-colors duration-(--hn-duration-base) ease-(--hn-ease-move) data-dragging:border-contribute-ink data-dragging:bg-contribute-paper-hover',
    '[--hn-surface:var(--color-contribute-paper)] [--hn-bg-subtle:var(--color-contribute-paper-subtle)] [--hn-bg-inset:var(--color-contribute-paper-inset)]',
    '[--hn-fg-default:var(--color-contribute-ink)] [--hn-fg-max:var(--color-contribute-ink)] [--hn-fg-muted:var(--color-contribute-ink-muted)]',
    '[--hn-fg-subtle:var(--color-contribute-ink-subtle)] [--hn-fg-disabled:var(--color-contribute-ink-disabled)]',
    '[--hn-border:var(--color-contribute-paper-edge)] [--hn-border-strong:var(--color-contribute-ink-border)]',
    '[--hn-neutral-solid:var(--color-contribute-ink)] [--hn-neutral-solid-on:var(--color-contribute-paper)]',
    '[--hn-accent:var(--color-contribute-ink)] [--hn-accent-on:var(--color-contribute-paper)] [--hn-accent-text:var(--color-contribute-ink)]',
    '[--hn-accent-soft:var(--color-contribute-paper-soft)] [--hn-accent-border:var(--color-contribute-ink-outline)] [--hn-focus-ring:var(--color-contribute-ink)]',
    '[--hn-shadow-sm:var(--shadow-contribute-paper-sm)] [--hn-shadow-md:var(--shadow-contribute-paper-md)] [--hn-shadow-lg:var(--shadow-contribute-paper-lg)]',
    '[--hn-scroll-shadow:var(--color-contribute-scroll-shadow)]',
    '[--hn-state-hover-opacity:var(--contribute-paper-hover-opacity)] [--hn-state-press-opacity:var(--contribute-paper-press-opacity)] [--hn-state-selected-opacity:var(--contribute-paper-selected-opacity)]',
  ]
  const kinds = [
    { value: 'novel', label: '小说' },
    { value: 'manga', label: '漫画' },
  ]
  const kind = ref('novel')
  const notice = ref('')
  const intake = useNovelIntake()
  const { items, plan, submitting } = intake
  const { requireLogin } = useAuthGate()
  const { large, control, body, caption } = useDeskSize()
  const pending = computed(
    () => items.value.filter(item => item.stage === 'ready' && item.verdict === 'unknown').length,
  )
  watchEffect(() => emit('selected', kind.value === 'novel' && items.value.length > 0))

  function receive(value: File | File[] | null) {
    const files = Array.isArray(value) ? value : value ? [value] : []
    const epubs = files.filter(file => /\.epub$/i.test(file.name))
    notice.value = epubs.length < files.length ? '仅支持 EPUB 文件。' : ''
    kind.value = 'novel'
    if (epubs.length && requireLogin()) intake.add(epubs)
  }

  defineExpose({ receive })
</script>

<template>
  <Card
    :class="cn(PAPER, large && '[--contribute-desk-width:var(--contribute-desk-width-large)]')"
    :data-dragging="dragging || undefined"
  >
    <Stack gap="sm">
      <Inline align="center" justify="between" gap="sm" :wrap="false">
        <SegmentedControl v-model="kind" :options="kinds" :size="control" aria-label="投稿类型" />
        <Inline align="center" gap="xs" :wrap="false">
          <IconButton
            label="我的投稿"
            :size="control"
            variant="ghost"
            tone="neutral"
            @click="emit('history')"
          >
            <History />
          </IconButton>
          <IconButton
            label="投稿说明"
            :size="control"
            variant="ghost"
            tone="neutral"
            @click="emit('help')"
          >
            <CircleHelp />
          </IconButton>
        </Inline>
      </Inline>

      <Stack
        v-if="kind === 'manga'"
        align="center"
        justify="center"
        class="min-h-(--contribute-upload-height)"
      >
        <Text :size="body" tone="muted">漫画投稿暂未开放</Text>
      </Stack>
      <Stack
        v-else-if="!items.length"
        gap="sm"
        align="center"
        justify="center"
        class="min-h-(--contribute-upload-height) text-center"
      >
        <Text :size="body" weight="medium">
          {{ dragging ? '松开以添加文件' : '将 EPUB 文件拖入页面' }}
        </Text>
        <Text :size="caption" tone="muted">支持一次添加多个单卷 EPUB</Text>
        <FileUpload
          :model-value="[]"
          multiple
          :list="false"
          variant="button"
          class="w-auto"
          accept=".epub,application/epub+zip"
          aria-label="选择 EPUB 文件"
          @update:model-value="receive"
          @reject="notice = '仅支持 EPUB 文件。'"
        >
          选择文件
        </FileUpload>
      </Stack>
      <template v-else>
        <Inline align="center" justify="between" gap="sm" :wrap="false">
          <Text :size="caption" tone="muted">
            共 {{ items.length }} 个文件{{ pending ? `，${pending} 个待确认` : '' }}
          </Text>
          <IconButton
            label="清空"
            :size="control"
            variant="ghost"
            tone="neutral"
            :disabled="submitting"
            @click="intake.clear()"
          >
            <Trash2 />
          </IconButton>
        </Inline>
        <ScrollArea
          class="-mx-[calc(var(--hn-focus-ring-width)+var(--hn-focus-ring-offset))] max-h-(--contribute-queue-body)"
        >
          <Stack
            gap="none"
            class="px-[calc(var(--hn-focus-ring-width)+var(--hn-focus-ring-offset))]"
          >
            <Entry
              v-for="item in items"
              :key="item.key"
              :item="item"
              :duplicate="plan.duplicates.has(item.key)"
              :locked="submitting"
              @remove="intake.remove(item.key)"
              @pick="intake.pick(item.key, $event)"
              @release="intake.release(item.key)"
              @retry="intake.retry(item.key)"
            />
          </Stack>
        </ScrollArea>
        <Inline
          align="center"
          justify="between"
          gap="sm"
          :wrap="false"
          class="border-t border-line pt-3"
        >
          <FileUpload
            :model-value="[]"
            multiple
            :list="false"
            variant="button"
            class="w-auto"
            accept=".epub,application/epub+zip"
            aria-label="添加 EPUB 文件"
            :disabled="submitting"
            @update:model-value="receive"
            @reject="notice = '仅支持 EPUB 文件。'"
          >
            添加文件
          </FileUpload>
          <Button :loading="submitting" :disabled="!plan.queue.length" @click="intake.submit()">
            提交 {{ plan.queue.length }} 卷
          </Button>
        </Inline>
      </template>
      <Text v-if="notice" :size="caption" tone="muted">{{ notice }}</Text>
    </Stack>
  </Card>
</template>
