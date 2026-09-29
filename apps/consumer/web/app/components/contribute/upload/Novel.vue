<script setup lang="ts">
  import { Button, FileUpload, IconButton, Inline, ScrollArea, Stack, Text } from '@hina-ui/vue'
  import { Trash2 } from '@lucide/vue'
  import { useDeskSize } from '~/features/contribute/useDeskSize'
  import type { useNovelIntake } from '~/features/contribute/useNovelIntake'
  import Entry from './Entry.vue'

  const props = defineProps<{ dragging: boolean; intake: ReturnType<typeof useNovelIntake> }>()

  const notice = ref('')
  const { items, plan, submitting } = props.intake
  const { requireLogin } = useAuthGate()
  const { control, body, caption } = useDeskSize()
  const pending = computed(
    () => items.value.filter(item => item.stage === 'ready' && item.verdict === 'unknown').length,
  )

  function receive(value: File | File[] | null) {
    const files = Array.isArray(value) ? value : value ? [value] : []
    const epubs = files.filter(file => /\.epub$/i.test(file.name))
    notice.value = epubs.length < files.length ? '仅支持 EPUB 文件。' : ''
    if (epubs.length && requireLogin()) props.intake.add(epubs)
  }

  defineExpose({ receive })
</script>

<template>
  <Stack gap="sm">
    <Stack
      v-if="!items.length"
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
        <Stack gap="none" class="px-[calc(var(--hn-focus-ring-width)+var(--hn-focus-ring-offset))]">
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
</template>
