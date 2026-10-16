<script setup lang="ts">
  import { Heading, IconButton, Inline, ScrollArea, Sheet, Stack } from '@hina-ui/vue'
  import { ArrowDownUp } from '@lucide/vue'
  import type { MangaReadingUnit } from '@hikarinagi/shared'
  import type { ContentsItem, ContentsUnits } from '~/features/manga/contents'
  import { useContentsDesc } from '~/features/manga/composables/useContents'

  defineOptions({ name: 'MangaContentsSheet' })

  defineProps<{
    units: ContentsUnits
    status: string | null
    currentId: number | null
    currentPage: number
    readIds: ReadonlySet<number>
    signedIn: boolean
  }>()
  const emit = defineEmits<{ select: [item: ContentsItem] }>()
  const open = defineModel<boolean>('open', { required: true })
  const unit = defineModel<MangaReadingUnit>('unit', { required: true })
  const range = defineModel<string | null>('range', { default: null })

  const desc = useContentsDesc()
  const scroller = useTemplateRef<InstanceType<typeof ScrollArea>>('scroller')

  watch(
    () => scroller.value?.viewport,
    viewport => {
      if (!viewport) return
      void nextTick(() => {
        const current = viewport.querySelector<HTMLElement>('[data-current]')
        if (!current) return
        const offset = current.getBoundingClientRect().top - viewport.getBoundingClientRect().top
        viewport.scrollTop += offset - viewport.clientHeight / 2
      })
    },
  )
</script>

<template>
  <Sheet v-model:open="open" title="目录" :description="status ?? undefined">
    <template #body>
      <Stack gap="none" class="h-manga-sheet min-h-0">
        <Inline gap="sm" :wrap="false" class="shrink-0 px-4 pb-2">
          <Heading :level="2" class="text-lg">目录</Heading>
          <TruncatedText
            v-if="status"
            :text="status"
            size="sm"
            tone="muted"
            class="min-w-0 flex-1 tabular-nums"
          />
          <IconButton
            :label="desc ? '正序' : '倒序'"
            size="sm"
            :class="desc ? 'ms-auto text-accent-text' : 'ms-auto'"
            @click="desc = !desc"
          >
            <ArrowDownUp />
          </IconButton>
        </Inline>
        <ScrollArea ref="scroller" class="min-h-0 flex-1">
          <MangaContentsBrowser
            v-model:unit="unit"
            v-model:range="range"
            :units="units"
            :current-id="currentId"
            :current-page="currentPage"
            :read-ids="readIds"
            :signed-in="signedIn"
            :desc="desc"
            variant="sheet"
            class="px-4 pb-[max(var(--hn-panel-p),env(safe-area-inset-bottom))]"
            @select="emit('select', $event)"
          />
        </ScrollArea>
      </Stack>
    </template>
  </Sheet>
</template>
