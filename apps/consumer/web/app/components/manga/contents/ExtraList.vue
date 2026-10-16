<script setup lang="ts">
  import { Grid, Indicator, Inline, Text } from '@hina-ui/vue'
  import { Lock } from '@lucide/vue'
  import { mangaChapterLabel } from '@hikarinagi/shared'
  import { isNewItem, type ContentsItem } from '~/features/manga/contents'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'MangaContentsExtraList' })

  const props = withDefaults(
    defineProps<{
      extras: ContentsItem[]
      currentId: number | null
      currentPage?: number
      readIds: ReadonlySet<number>
      signedIn: boolean
      desc?: boolean
      columns?: 1 | 2
    }>(),
    { currentPage: 0, desc: false, columns: 2 },
  )
  const emit = defineEmits<{ select: [item: ContentsItem] }>()

  const shown = computed(() => (props.desc ? [...props.extras].reverse() : props.extras))
</script>

<template>
  <Grid :cols="columns" gap="none" class="gap-x-6">
    <Inline
      v-for="item in shown"
      :key="item.id"
      as="button"
      type="button"
      gap="sm"
      :wrap="false"
      :data-current="item.id === currentId ? '' : undefined"
      class="hn-state-layer min-h-(--hn-row-h) min-w-0 hn-interactive border-b border-line px-(--hn-row-px) text-start"
      @click="emit('select', item)"
    >
      <TruncatedText
        :text="mangaChapterLabel(item)"
        as="span"
        size="sm"
        :weight="item.id === currentId ? 'medium' : undefined"
        :class="
          cn(
            'min-w-0 flex-1',
            item.id === currentId && 'text-accent-text',
            item.id !== currentId && readIds.has(item.id) && 'text-faint',
          )
        "
      />
      <Lock
        v-if="!signedIn && !item.guest_readable"
        class="size-3 shrink-0 text-muted"
        :stroke-width="2.4"
        aria-label="需要登录"
      />
      <Indicator
        v-else-if="item.id !== currentId && isNewItem(item, readIds)"
        tone="accent"
        size="sm"
        label="新"
      />
      <Text as="span" size="xs" tone="muted" class="shrink-0 tabular-nums">
        {{ item.id === currentId ? `读到第 ${currentPage} 页` : `${item.page_count} 页` }}
      </Text>
    </Inline>
  </Grid>
</template>
