<script setup lang="ts">
  import { Inline, ScrollArea, Stack, Text } from '@hina-ui/vue'
  import type { LightNovelVolumePageData } from '~~/server/api/pages/light-novel-volumes/[id].get'
  import { monthText } from '~/features/entry/date'
  import { getLightNovelVolumeCover, getLightNovelVolumeLabel } from '~/utils/media/light-novel'

  defineOptions({ name: 'LightNovelVolumeSeriesStrip' })
  defineProps<{
    volumes: LightNovelVolumePageData['volumes']
    current: number
  }>()

  const area = useTemplateRef<InstanceType<typeof ScrollArea>>('area')
  const today = new Date().toISOString().slice(0, 10)
  const dateLine = (date: string | null | undefined) => {
    if (!date) return ''
    return date.slice(0, 10) > today ? '未发售' : monthText(date)
  }

  watch(
    () => area.value?.viewport,
    viewport => {
      const item = viewport?.querySelector<HTMLElement>('[data-current="true"]')
      if (!viewport || !item) return
      const offset = item.getBoundingClientRect().left - viewport.getBoundingClientRect().left
      viewport.scrollLeft += offset - (viewport.clientWidth - item.offsetWidth) / 2
    },
    { flush: 'post' },
  )
</script>

<template>
  <EntrySectionHead id="series" title="同系列" :count="volumes.length" />
  <ScrollArea ref="area" direction="horizontal" class="-mx-4 lg:-mx-1">
    <Inline gap="md" align="end" :wrap="false" class="px-4 pt-1 pb-3 lg:px-1">
      <NuxtLink
        v-for="volume in volumes"
        :key="volume.id"
        :to="`/light-novel-volumes/${volume.id}`"
        :data-current="volume.id === current"
        :aria-current="volume.id === current ? 'page' : undefined"
        class="block shrink-0 hn-interactive rounded-md"
      >
        <Stack
          gap="xs"
          class="transition-opacity duration-(--hn-duration-fast)"
          :class="volume.id === current ? 'w-28' : 'w-22 opacity-75 hover:opacity-100'"
        >
          <EntryBookCover
            :media="getLightNovelVolumeCover(volume)"
            :alt="`${getLightNovelVolumeLabel(volume)}封面`"
            :width="240"
            :class="
              volume.id === current
                ? 'ring-2! ring-accent! ring-offset-2 ring-offset-(--hn-bg-canvas)'
                : undefined
            "
          />
          <Text
            size="sm"
            :weight="volume.id === current ? 'semibold' : 'normal'"
            truncate
            class="tabular-nums"
          >
            {{ getLightNovelVolumeLabel(volume) }}
          </Text>
          <Text size="xs" tone="muted" class="tabular-nums">
            {{ dateLine(volume.publication_date) }}
          </Text>
        </Stack>
      </NuxtLink>
    </Inline>
  </ScrollArea>
</template>
