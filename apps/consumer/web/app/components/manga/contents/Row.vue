<script setup lang="ts">
  import { Card, Inline, ScrollArea, Stack, Text } from '@hina-ui/vue'
  import { Lock } from '@lucide/vue'
  import { mangaChapterLabel, type MangaReadingUnit } from '@hikarinagi/shared'
  import { isNewItem, type ContentsItem, type ContentsUnits } from '~/features/manga/contents'

  defineOptions({ name: 'MangaContentsRow' })

  const props = defineProps<{
    unit: MangaReadingUnit
    units: ContentsUnits
    currentId: number | null
    currentPage: number
    readIds: ReadonlySet<number>
    signedIn: boolean
  }>()
  const emit = defineEmits<{ select: [item: ContentsItem] }>()

  const scroller = useTemplateRef<InstanceType<typeof ScrollArea>>('scroller')

  function state(item: ContentsItem) {
    if (item.id === props.currentId) return 'current'
    return props.readIds.has(item.id) ? 'read' : 'unread'
  }

  watch(
    [() => scroller.value?.viewport, () => props.unit],
    ([viewport]) => {
      if (!viewport) return
      void nextTick(() => {
        const current = viewport.querySelector<HTMLElement>('[data-current]')
        viewport.scrollLeft = current
          ? current.offsetLeft - (viewport.clientWidth - current.clientWidth) / 2
          : 0
      })
    },
    { immediate: true },
  )
</script>

<template>
  <ScrollArea ref="scroller" direction="horizontal" :scrollbar="false" class="-mx-5 px-5">
    <Inline gap="sm" :wrap="false" class="w-max py-1">
      <template v-if="unit === 'chapter'">
        <MangaContentsChapterCell
          v-for="item in units.chapter"
          :key="item.id"
          :item="item"
          :state="state(item)"
          :current-page="currentPage"
          :fresh="isNewItem(item, readIds)"
          :locked="!signedIn && !item.guest_readable"
          size="lg"
          class="w-18"
          :data-current="item.id === currentId ? '' : undefined"
          @select="emit('select', $event)"
        />
      </template>
      <template v-else-if="unit === 'volume'">
        <MangaContentsVolumeCover
          v-for="item in units.volume"
          :key="item.id"
          :item="item"
          :read="readIds.has(item.id)"
          :current="item.id === currentId"
          :current-page="currentPage"
          :locked="!signedIn && !item.guest_readable"
          class="w-24"
          :data-current="item.id === currentId ? '' : undefined"
          @select="emit('select', $event)"
        />
      </template>
      <template v-else>
        <Card
          v-for="item in units.extra"
          :key="item.id"
          as="button"
          type="button"
          :data-current="item.id === currentId ? '' : undefined"
          class="hn-state-layer w-40 shrink-0 hn-interactive text-start hn-press-lg"
          @click="emit('select', item)"
        >
          <Stack gap="xs">
            <TruncatedText
              :text="mangaChapterLabel(item)"
              size="sm"
              weight="medium"
              :class="
                item.id === currentId
                  ? 'text-accent-text'
                  : readIds.has(item.id)
                    ? 'text-faint'
                    : undefined
              "
            />
            <Inline gap="xs" :wrap="false">
              <Lock
                v-if="!signedIn && !item.guest_readable"
                class="size-3 shrink-0 text-muted"
                :stroke-width="2.4"
                aria-label="需要登录"
              />
              <Text size="xs" tone="muted" class="tabular-nums">
                {{ item.id === currentId ? `读到第 ${currentPage} 页` : `${item.page_count} 页` }}
              </Text>
            </Inline>
          </Stack>
        </Card>
      </template>
    </Inline>
  </ScrollArea>
</template>
