<script setup lang="ts">
  import { Card, Indicator, Progress, Ripple, Text } from '@hina-ui/vue'
  import { Lock } from '@lucide/vue'
  import { mangaChapterHeading, mangaChapterNumber } from '@hikarinagi/shared'
  import type { ContentsItem } from '~/features/manga/contents'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'MangaContentsChapterCell' })

  const props = withDefaults(
    defineProps<{
      item: ContentsItem
      state: 'unread' | 'read' | 'current'
      currentPage?: number
      fresh?: boolean
      locked?: boolean
      size?: 'md' | 'lg'
    }>(),
    { currentPage: 0, fresh: false, locked: false, size: 'md' },
  )
  const emit = defineEmits<{ select: [item: ContentsItem] }>()

  const number = computed(() => mangaChapterNumber(props.item.chapter_number ?? ''))
  const reading = computed(() => props.state === 'current' && props.currentPage > 0)
  const caption = computed(() =>
    reading.value
      ? `${props.currentPage} / ${props.item.page_count}`
      : `${props.item.page_count} 页`,
  )
  const progress = computed(() =>
    props.item.page_count ? Math.min(1, props.currentPage / props.item.page_count) : 0,
  )
  const aria = computed(() =>
    [
      mangaChapterHeading(props.item),
      reading.value
        ? `读到第 ${props.currentPage} 页，共 ${props.item.page_count} 页`
        : caption.value,
      props.state === 'read' ? '已读' : props.state === 'current' ? '上次读到' : '',
      props.locked ? '需要登录' : '',
    ]
      .filter(Boolean)
      .join('，'),
  )
</script>

<template>
  <Card
    as="button"
    type="button"
    :padded="false"
    :aria-label="aria"
    :class="
      cn(
        'hn-state-layer relative flex min-w-0 hn-interactive flex-col items-center overflow-hidden px-1 shadow-none hn-press-lg',
        size === 'lg' ? 'py-2' : 'py-1.5',
        state === 'read' && 'border-transparent bg-subtle',
        state === 'current' && 'border-accent bg-accent-soft',
      )
    "
    @click="emit('select', item)"
  >
    <Ripple />
    <Text
      as="span"
      size="sm"
      :weight="state === 'read' ? 'normal' : 'semibold'"
      :tone="state === 'read' ? 'faint' : undefined"
      :class="cn('tabular-nums', state === 'current' && 'text-accent-text')"
    >
      {{ number }}
    </Text>
    <TruncatedText
      :text="caption"
      as="span"
      size="xs"
      :tone="state === 'current' ? undefined : 'muted'"
      :class="cn('max-w-full tabular-nums', state === 'current' && 'text-accent-text')"
    />
    <Lock
      v-if="locked"
      class="absolute end-1 top-1 size-3 text-muted"
      :stroke-width="2.4"
      aria-hidden="true"
    />
    <Indicator v-else-if="fresh" tone="accent" size="sm" class="absolute end-1 top-1" />
    <Progress
      v-if="state === 'current'"
      :value="progress"
      :max="1"
      size="sm"
      aria-hidden="true"
      class="absolute inset-x-0 bottom-0"
    />
  </Card>
</template>
