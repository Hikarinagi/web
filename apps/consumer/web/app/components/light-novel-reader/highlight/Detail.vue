<script setup lang="ts">
  import { Button, Center, IconButton, Inline, Stack, Text, Textarea, toast } from '@hina-ui/vue'
  import { Copy, Trash2 } from '@lucide/vue'
  import { useReader } from '~/features/light-novel-reader/context'
  import { HIGHLIGHT_COLORS } from '~/features/light-novel-reader/highlights'
  import type { HighlightEntry } from '~/features/light-novel-reader/useReaderHighlights'

  defineOptions({ name: 'LightNovelReaderHighlightDetail' })

  defineProps<{ quoted?: boolean }>()

  const { engine, highlights } = useReader()
  const { inspector, entries, preview } = highlights
  const found = computed(
    () =>
      entries.value.find(item => item.id === inspector.id) ??
      (preview.value?.id === inspector.id ? preview.value : null),
  )
  const entry = shallowRef<HighlightEntry | null>(found.value)
  watch(found, value => {
    if (value) entry.value = value
  })
  const swatch = computed(
    () => HIGHLIGHT_COLORS.find(color => color.value === entry.value?.color)?.swatch,
  )
  const field = useTemplateRef<InstanceType<typeof Textarea>>('field')
  const { copy } = useClipboard({ legacy: true })

  const draft = reactive({ id: null as string | null, text: '' })
  const saved = ref(false)

  function commit() {
    const current = entries.value.find(item => item.id === draft.id)
    if (!current || current.note === draft.text) return
    engine.stack.value?.controller.updateAnnotation(current.id, { note: draft.text })
    saved.value = true
  }
  const debounced = useDebounceFn(commit, 800)

  watch(
    () => entry.value?.id ?? null,
    id => {
      commit()
      draft.id = id
      draft.text = entry.value?.note ?? ''
      saved.value = false
      if (id && inspector.focus) void nextTick(() => field.value?.focus())
    },
    { immediate: true },
  )
  watch(
    () => draft.text,
    () => {
      saved.value = false
      void debounced()
    },
  )
  onBeforeUnmount(commit)

  function recolor(color: string) {
    if (entry.value) engine.stack.value?.controller.updateAnnotation(entry.value.id, { color })
  }

  async function copyQuote() {
    if (!entry.value) return
    await copy(entry.value.quote)
    toast.success('已复制引文')
  }

  function remove() {
    const current = entry.value
    if (!current) return
    highlights.remove(current.id)
    toast.success('已删除高亮', {
      duration: 5000,
      action: { label: '撤销', onClick: () => highlights.restore(current) },
    })
  }
</script>

<template>
  <Stack v-if="entry" gap="lg" data-tour="inspector">
    <Text
      v-if="quoted"
      size="sm"
      class="border-s-2 ps-3 leading-relaxed"
      :style="{ borderColor: swatch }"
    >
      {{ entry.quote }}
    </Text>
    <Inline gap="xs" role="group" aria-label="高亮颜色">
      <IconButton
        v-for="color in HIGHLIGHT_COLORS"
        :key="color.value"
        :label="color.label"
        size="sm"
        :variant="entry.color === color.value ? 'soft' : 'ghost'"
        tone="neutral"
        :aria-pressed="entry.color === color.value"
        @click="recolor(color.value)"
      >
        <Center as="span" class="size-4 rounded-full" :style="{ background: color.swatch }" />
      </IconButton>
    </Inline>
    <Stack gap="xs">
      <Textarea
        ref="field"
        v-model="draft.text"
        :autosize="{ minRows: 4, maxRows: 16 }"
        aria-label="笔记"
      />
      <Text v-if="entry.failed" size="xs" tone="muted">未同步，联网后会自动重试</Text>
      <Text v-else-if="saved" size="xs" tone="muted">已自动保存</Text>
    </Stack>
    <Inline gap="sm">
      <Button variant="ghost" tone="neutral" size="sm" @click="copyQuote">
        <template #icon><Copy aria-hidden="true" /></template>
        复制引文
      </Button>
      <Button variant="ghost" tone="danger" size="sm" @click="remove">
        <template #icon><Trash2 aria-hidden="true" /></template>
        删除
      </Button>
    </Inline>
  </Stack>
</template>
