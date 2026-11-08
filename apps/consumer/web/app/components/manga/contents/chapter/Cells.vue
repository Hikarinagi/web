<script setup lang="ts">
  import { Grid, SimpleGrid, Stack, Text } from '@hina-ui/vue'
  import {
    isNewItem,
    type ContentsCell,
    type ContentsItem,
    type ContentsVariant,
  } from '~/features/manga/contents'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'MangaContentsChapterCells' })

  const props = defineProps<{
    cells: ContentsCell[]
    currentId: number | null
    currentPage: number
    readIds: ReadonlySet<number>
    signedIn: boolean
    variant: ContentsVariant
  }>()
  const emit = defineEmits<{ select: [item: ContentsItem] }>()

  const size = computed(() => (props.variant === 'sheet' ? 'lg' : 'md'))
  const layout = computed(() =>
    props.variant === 'page'
      ? { is: SimpleGrid, attrs: { min: '6rem' } }
      : { is: Grid, attrs: { cols: 5 } },
  )

  function state(item: ContentsItem) {
    if (item.id === props.currentId) return 'current'
    return props.readIds.has(item.id) ? 'read' : 'unread'
  }
</script>

<template>
  <component :is="layout.is" v-bind="layout.attrs" gap="sm">
    <template v-for="cell in cells" :key="cell.key">
      <Stack
        v-if="cell.kind === 'gap'"
        as="span"
        align="center"
        gap="none"
        :aria-label="`第 ${cell.number} 话，暂无`"
        :class="
          cn(
            'rounded-lg border border-dashed border-line-strong px-1',
            size === 'lg' ? 'py-2' : 'py-1.5',
          )
        "
      >
        <Text as="span" size="sm" tone="disabled" class="tabular-nums">{{ cell.number }}</Text>
        <Text as="span" size="xs" tone="disabled">暂无</Text>
      </Stack>
      <MangaContentsChapterCell
        v-else
        :item="cell.item"
        :state="state(cell.item)"
        :current-page="currentPage"
        :fresh="isNewItem(cell.item, readIds)"
        :locked="!signedIn && !cell.item.guest_readable"
        :size="size"
        :data-current="cell.item.id === currentId ? '' : undefined"
        @select="emit('select', $event)"
      />
    </template>
  </component>
</template>
