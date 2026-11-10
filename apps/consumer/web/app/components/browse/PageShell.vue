<script setup lang="ts" generic="T extends { id: number }">
  import {
    Badge,
    Button,
    Dialog,
    Empty,
    Grid,
    Heading,
    IconButton,
    Inline,
    SegmentedControl,
    Select,
    Sheet,
    Stack,
  } from '@hina-ui/vue'
  import { LayoutGrid, List, SlidersHorizontal } from '@lucide/vue'
  import type { PageMeta } from '@hikarinagi/shared'
  import type { BrowseChip } from '~/features/browse/filter'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'BrowsePageShell' })

  const props = defineProps<{
    title: string
    kind: string
    items: T[]
    meta: PageMeta
    pending?: boolean
    chips: BrowseChip[]
    sorts: { value: string; label: string }[]
    sort: string
    moreCount: number
    ratio: '3/4' | '2/3'
  }>()
  const emit = defineEmits<{ sort: [value: string]; clear: []; clearMore: [] }>()
  defineSlots<{
    filters(): unknown
    more(): unknown
    sheet(): unknown
    row(props: { item: T }): unknown
    tile(props: { item: T }): unknown
  }>()

  const view = useCookie<'list' | 'grid'>(`browse-view-${props.kind}`, {
    default: () => 'list',
    maxAge: 60 * 60 * 24 * 365,
  })
  const more = ref(false)
  const sheet = ref(false)
  const views = [
    { value: 'list', label: '列表', icon: List },
    { value: 'grid', label: '封面', icon: LayoutGrid },
  ]
  const listId = computed(() => `${props.kind}-browse-list`)
  const total = computed(() => props.meta.total_items)

  function changeSort(value: string | number | null | undefined) {
    if (value != null && value !== props.sort) emit('sort', String(value))
  }
</script>

<template>
  <Stack gap="md" class="mx-auto w-full max-w-app px-4 pt-5 pb-16 lg:px-6">
    <Heading :level="1" class="sr-only">{{ title }}</Heading>
    <Stack
      gap="sm"
      class="sticky top-(--app-header-height) z-10 -mx-4 bg-canvas/90 px-4 py-2 backdrop-blur lg:-mx-6 lg:px-6"
    >
      <Inline gap="sm" align="center" :wrap="false" class="min-w-0 max-sm:hidden">
        <slot name="filters" />
        <Badge :content="moreCount || null" tone="accent" :label="`已选 ${moreCount} 项`">
          <Button variant="outline" tone="neutral" @click="more = true">
            <template #icon><SlidersHorizontal /></template>
            更多筛选
          </Button>
        </Badge>
        <Inline gap="sm" align="center" :wrap="false" class="ms-auto shrink-0">
          <Select
            :model-value="sort"
            :options="sorts"
            aria-label="排序"
            class="w-40"
            @update:model-value="changeSort"
          />
          <SegmentedControl v-model="view" :options="views" aria-label="视图">
            <template #option="{ option }">
              <Inline gap="xs" align="center" :wrap="false">
                <component :is="option.icon" class="size-4" />
                {{ option.label }}
              </Inline>
            </template>
          </SegmentedControl>
        </Inline>
      </Inline>
      <Inline gap="sm" align="center" :wrap="false" class="sm:hidden">
        <Badge
          :content="chips.length || null"
          tone="accent"
          :label="`已选 ${chips.length} 个条件`"
          class="shrink-0"
        >
          <Button variant="outline" tone="neutral" @click="sheet = true">
            <template #icon><SlidersHorizontal /></template>
            筛选
          </Button>
        </Badge>
        <Select
          :model-value="sort"
          :options="sorts"
          aria-label="排序"
          class="min-w-0 flex-1"
          @update:model-value="changeSort"
        />
        <IconButton
          variant="outline"
          tone="neutral"
          :label="view === 'list' ? '切换为封面视图' : '切换为列表视图'"
          :tooltip="false"
          class="shrink-0"
          @click="view = view === 'list' ? 'grid' : 'list'"
        >
          <LayoutGrid v-if="view === 'list'" />
          <List v-else />
        </IconButton>
      </Inline>
      <BrowseConditions :chips="chips" @clear="emit('clear')" />
    </Stack>

    <Stack :id="listId" gap="lg" class="relative">
      <Empty v-if="!items.length" title="没有符合条件的作品">
        <template v-if="chips.length" #actions>
          <Button variant="outline" tone="neutral" size="sm" @click="emit('clear')"
            >清除全部条件</Button
          >
        </template>
      </Empty>
      <Grid v-else-if="view === 'list'" :cols="1" gap="none" class="gap-x-6 lg:grid-cols-2">
        <template v-for="item in items" :key="item.id">
          <slot name="row" :item="item" />
        </template>
      </Grid>
      <Grid
        v-else
        :cols="3"
        gap="none"
        :class="
          cn(
            'gap-x-4 gap-y-5 sm:grid-cols-4 md:grid-cols-6',
            ratio === '3/4' ? 'lg:grid-cols-8' : 'lg:grid-cols-9',
          )
        "
      >
        <template v-for="item in items" :key="item.id">
          <slot name="tile" :item="item" />
        </template>
      </Grid>
      <LoadingOverlay :visible="pending" />
      <Paginator
        :meta="meta"
        :loading="pending"
        route="push"
        align="center"
        :scroll-target="`#${listId}`"
      />
    </Stack>

    <Dialog v-model:open="more" title="更多筛选" size="md">
      <template #content>
        <slot name="more" />
      </template>
      <template #footer>
        <Button variant="ghost" tone="neutral" @click="emit('clearMore')">清除</Button>
        <Button :disabled="!total" @click="more = false">
          {{ total ? '查看结果' : '没有符合条件的作品' }}
        </Button>
      </template>
    </Dialog>

    <Sheet v-model:open="sheet" title="筛选">
      <template #content>
        <slot name="sheet" />
      </template>
      <template #footer>
        <Button variant="ghost" tone="neutral" @click="emit('clear')">清除</Button>
        <Button :disabled="!total" @click="sheet = false">
          {{ total ? '查看结果' : '没有符合条件的作品' }}
        </Button>
      </template>
    </Sheet>
  </Stack>
</template>
