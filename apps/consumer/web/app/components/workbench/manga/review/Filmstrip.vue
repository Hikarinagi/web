<script setup lang="ts">
  import {
    Badge,
    Card,
    Image,
    Indicator,
    Ripple,
    Stack,
    Text,
    VirtualList,
    type VirtualListExpose,
  } from '@hina-ui/vue'
  import { useMangaReview } from '~/features/workbench/manga/review/context'
  import { pageSrc } from '~/features/workbench/manga/review/pages'
  import { cn } from '~/utils/cn'

  const { state } = useMangaReview()
  const list = useTemplateRef<VirtualListExpose>('list')

  watch(
    () => state.index.value,
    index => list.value?.scrollToIndex(index, { align: 'center', behavior: 'smooth' }),
  )
  onMounted(() => list.value?.scrollToIndex(state.index.value, { align: 'center' }))
</script>

<template>
  <VirtualList
    ref="list"
    :items="state.rows.value"
    :get-key="row => row.page.id"
    orientation="horizontal"
    :estimate-size="56"
    :dynamic="false"
    :gap="8"
    :padding-start="16"
    :padding-end="16"
    :height="104"
    :shadow="false"
    label="胶片栏"
    class="shrink-0 border-t border-line bg-surface"
  >
    <template #default="{ item: row, index }">
      <Stack gap="xs" align="center" class="py-2">
        <Badge
          :content="row.flags.length || row.unmatched || row.notes ? '1' : null"
          placement="top-end"
          bare
          label="这一页有标记或批注"
        >
          <template #content>
            <Indicator :tone="row.notes && !row.flags.length ? 'accent' : 'warning'" size="sm" />
          </template>
          <Card
            as="button"
            type="button"
            :padded="false"
            :aria-label="`第 ${row.number} 页`"
            :aria-current="index === state.index.value ? 'page' : undefined"
            :class="
              cn(
                'hn-state-layer relative h-16 w-11 hn-interactive overflow-hidden hn-press-lg',
                index === state.index.value && 'ring-2 ring-accent',
              )
            "
            @click="state.open(index)"
          >
            <Image :src="pageSrc(row.page)" alt="" fit="cover" class="size-full" />
            <Ripple />
          </Card>
        </Badge>
        <Text
          size="xs"
          :tone="index === state.index.value ? 'default' : 'muted'"
          class="tabular-nums"
        >
          {{ row.number }}
        </Text>
      </Stack>
    </template>
  </VirtualList>
</template>
