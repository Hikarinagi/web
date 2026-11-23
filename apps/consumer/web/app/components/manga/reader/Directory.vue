<script setup lang="ts">
  import { CloseButton, Drawer, Heading, IconButton, Inline, ScrollArea, Stack } from '@hina-ui/vue'
  import { ArrowDownUp } from '@lucide/vue'
  import type { MangaReadingUnit } from '@hikarinagi/shared'
  import type { ContentsItem, ContentsUnits } from '~/features/manga/contents'
  import { useContentsDesc } from '~/features/manga/composables/useContents'

  defineOptions({ name: 'MangaReaderDirectory' })

  defineProps<{
    narrow: boolean
    dark: boolean
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
  <MangaContentsSheet
    v-if="narrow"
    v-model:open="open"
    v-model:unit="unit"
    v-model:range="range"
    :units="units"
    :status="status"
    :current-id="currentId"
    :current-page="currentPage"
    :read-ids="readIds"
    :signed-in="signedIn"
    :class="dark ? 'dark' : undefined"
    @select="emit('select', $event)"
  />
  <Drawer v-else v-model:open="open" title="目录" size="md" :class="dark ? 'dark' : undefined">
    <template #body="{ close }">
      <Stack gap="none" class="h-full min-h-0">
        <Inline gap="xs" :wrap="false" class="shrink-0 px-5 pt-4 pb-2">
          <Stack gap="none" class="min-w-0 flex-1">
            <Heading :level="2" class="text-lg">目录</Heading>
            <TruncatedText
              v-if="status"
              :text="status"
              size="xs"
              tone="muted"
              class="tabular-nums"
            />
          </Stack>
          <IconButton
            :label="desc ? '正序' : '倒序'"
            :class="desc ? 'text-accent-text' : undefined"
            @click="desc = !desc"
          >
            <ArrowDownUp />
          </IconButton>
          <CloseButton @click="close" />
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
            variant="drawer"
            class="px-5 pb-5"
            @select="emit('select', $event)"
          />
        </ScrollArea>
      </Stack>
    </template>
  </Drawer>
</template>
