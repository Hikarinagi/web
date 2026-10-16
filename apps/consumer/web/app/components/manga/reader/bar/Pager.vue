<script setup lang="ts">
  import { Button, Card, Inline, NumberInput, Popover, Slider, Stack, Text } from '@hina-ui/vue'
  import type { ReaderPage } from '../composables/useMangaReader'
  import type { PageLoadStatus } from '../composables/usePageLoader'
  import type { MangaReaderDirection } from '../lib/settings'

  defineOptions({ name: 'MangaReaderPager' })

  const props = defineProps<{
    pages: ReaderPage[]
    shown: number[]
    direction: MangaReaderDirection
    spreadOf: (page: number) => number[]
    statusOf: (page: number) => PageLoadStatus
    imageOf: (page: number) => HTMLImageElement | null
  }>()
  const emit = defineEmits<{ jump: [page: number]; peek: [pages: number[]] }>()

  const total = computed(() => props.pages.length)
  const span = (list: number[]) =>
    list.length > 1 ? `${Math.min(...list)}–${Math.max(...list)}` : String(list[0] ?? 1)
  const current = computed(() => Math.max(1, ...props.shown))

  const draft = ref<number | null>(null)
  const value = computed(() => draft.value ?? current.value)
  const preview = computed(() => (draft.value === null ? [] : props.spreadOf(draft.value)))
  const previewPages = computed(() =>
    preview.value.flatMap(number => props.pages.filter(page => page.page_number === number)),
  )
  const position = computed(() => {
    const ratio = total.value > 1 ? (value.value - 1) / (total.value - 1) : 0
    return `${(props.direction === 'rtl' ? 1 - ratio : ratio) * 100}%`
  })

  function drag(next: number | undefined) {
    draft.value = next ?? null
    if (draft.value !== null) emit('peek', props.spreadOf(draft.value))
  }

  function commit() {
    const target = draft.value
    draft.value = null
    if (target !== null && target !== current.value) emit('jump', target)
  }

  const jumpOpen = ref(false)
  const typed = ref<number | null>(null)
  watch(jumpOpen, open => {
    if (open) typed.value = current.value
  })

  function jump() {
    if (typed.value == null) return
    emit('jump', Math.min(total.value, Math.max(1, Math.round(typed.value))))
    jumpOpen.value = false
  }
</script>

<template>
  <Inline gap="sm" :wrap="false" class="min-w-0 flex-1">
    <Popover v-model:open="jumpOpen" side="top" :modal="false">
      <Button
        variant="ghost"
        tone="neutral"
        size="sm"
        class="shrink-0 tabular-nums"
        :aria-label="`第 ${span(shown)} 页，共 ${total} 页，点击跳页`"
      >
        {{ span(shown) }} / {{ total }}
      </Button>
      <template #content>
        <Stack gap="sm" class="w-56">
          <Text size="sm" weight="medium">跳至页码</Text>
          <Inline gap="sm" :wrap="false">
            <NumberInput
              v-model="typed"
              :min="1"
              :max="total"
              size="sm"
              class="min-w-0 flex-1"
              aria-label="页码"
              @keydown.enter="jump"
            />
            <Button size="sm" @click="jump">跳转</Button>
          </Inline>
          <Text size="xs" tone="muted" class="tabular-nums">共 {{ total }} 页</Text>
        </Stack>
      </template>
    </Popover>

    <Stack gap="none" class="relative min-w-0 flex-1">
      <Card
        v-if="previewPages.length"
        class="pointer-events-none absolute bottom-full mb-3 -translate-x-1/2"
        :style="{ left: position }"
      >
        <Stack gap="xs" align="center">
          <Inline
            gap="xs"
            :wrap="false"
            :class="direction === 'rtl' ? 'flex-row-reverse' : undefined"
          >
            <MangaReaderThumb
              v-for="page in previewPages"
              :key="page.page_number"
              :page="page"
              :status="statusOf(page.page_number)"
              :image="imageOf(page.page_number)"
            />
          </Inline>
          <Text size="xs" tone="muted" class="tabular-nums">第 {{ span(preview) }} 页</Text>
        </Stack>
      </Card>
      <Slider
        :dir="direction"
        :model-value="value"
        :min="1"
        :max="Math.max(total, 1)"
        size="sm"
        label="none"
        :aria-label="`阅读进度，第 ${value} 页，共 ${total} 页`"
        @update:model-value="drag"
        @commit="commit"
      />
    </Stack>
  </Inline>
</template>
