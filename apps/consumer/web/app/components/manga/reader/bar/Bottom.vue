<script setup lang="ts">
  import { Button, Flex, IconButton, Inline, Stack, Text } from '@hina-ui/vue'
  import { BookOpen, ChevronLeft, ChevronRight, List, ScrollText, Settings2 } from '@lucide/vue'
  import type { ReaderPage } from '../composables/useMangaReader'
  import type { PageLoadStatus } from '../composables/usePageLoader'
  import type { MangaReaderDirection, MangaReaderMode } from '../lib/settings'
  import type PagerBar from './Pager.vue'

  defineOptions({ name: 'MangaReaderBarBottom' })

  const props = defineProps<{
    narrow: boolean
    dark: boolean
    noun: string
    hasPrevious: boolean
    hasNext: boolean
    mode: MangaReaderMode
    pages: ReaderPage[]
    shown: number[]
    direction: MangaReaderDirection
    spreadOf: (page: number) => number[]
    statusOf: (page: number) => PageLoadStatus
    imageOf: (page: number) => HTMLImageElement | null
  }>()
  const emit = defineEmits<{
    previous: []
    next: []
    jump: [page: number]
    peek: [pages: number[]]
    directory: []
    toggleMode: []
    settings: [event: Event]
  }>()

  const ends = computed(() => {
    const previous = { key: 'previous', label: `上一${props.noun}`, enabled: props.hasPrevious }
    const next = { key: 'next', label: `下一${props.noun}`, enabled: props.hasNext }
    return props.direction === 'rtl' ? [next, previous] : [previous, next]
  })

  function go(key: string) {
    if (key === 'next') emit('next')
    else emit('previous')
  }

  const tools = computed(() => [
    { key: 'directory', label: '目录', icon: List, run: () => emit('directory') },
    {
      key: 'mode',
      label: props.mode === 'scroll' ? '条漫' : '翻页',
      icon: props.mode === 'scroll' ? ScrollText : BookOpen,
      run: () => emit('toggleMode'),
    },
    {
      key: 'settings',
      label: '设置',
      icon: Settings2,
      run: (event: Event) => emit('settings', event),
    },
  ])

  const pager = useTemplateRef<InstanceType<typeof PagerBar>>('pager')
  defineExpose({ pager })
</script>

<template>
  <Stack
    gap="none"
    class="border-t border-line bg-veil px-3 pb-[env(safe-area-inset-bottom)] backdrop-blur-(--hn-blur-scrim)"
  >
    <Flex align="center" gap="sm" :wrap="false" class="min-h-15">
      <template v-for="(end, index) in ends" :key="end.key">
        <IconButton
          v-if="narrow"
          :label="end.label"
          variant="ghost"
          tone="neutral"
          :disabled="!end.enabled"
          :class="index === 1 ? 'order-last' : undefined"
          @click="go(end.key)"
        >
          <ChevronLeft v-if="index === 0" />
          <ChevronRight v-else />
        </IconButton>
        <Button
          v-else
          variant="soft"
          tone="neutral"
          size="sm"
          :disabled="!end.enabled"
          :class="index === 1 ? 'order-last shrink-0' : 'shrink-0'"
          @click="go(end.key)"
        >
          {{ end.label }}
        </Button>
      </template>
      <MangaReaderBarPager
        ref="pager"
        :pages="pages"
        :shown="shown"
        :direction="direction"
        :spread-of="spreadOf"
        :status-of="statusOf"
        :image-of="imageOf"
        :dark="dark"
        @jump="emit('jump', $event)"
        @peek="emit('peek', $event)"
      />
    </Flex>
    <Inline v-if="narrow" gap="none" :wrap="false" class="pb-1">
      <Stack
        v-for="tool in tools"
        :key="tool.key"
        as="button"
        type="button"
        :data-tour="tool.key"
        align="center"
        gap="none"
        class="hn-state-layer flex-1 hn-interactive gap-0.5 rounded-md py-1.5"
        @click="tool.run"
      >
        <component :is="tool.icon" class="size-5.5" aria-hidden="true" />
        <Text as="span" size="xs" tone="muted">{{ tool.label }}</Text>
      </Stack>
    </Inline>
  </Stack>
</template>
