<script setup lang="ts">
  import { Divider, Heading, IconButton, Inline, Stack, Text } from '@hina-ui/vue'
  import { ArrowLeft, CircleQuestionMark, PanelLeft, Type } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { LightNovelVolumeReaderPageData } from '~~/server/api/pages/light-novel-volumes/[id]/reader.get'
  import { useReader } from '~/features/light-novel-reader/context'
  import { getLightNovelTitle, getLightNovelVolumeTitle } from '~/utils/media/light-novel'

  defineOptions({ name: 'LightNovelReaderDesktopTopBar' })

  const props = defineProps<{ data: LightNovelVolumeReaderPageData }>()

  const { shell, settings, tour } = useReader()
  const { medium, wide, stored, drawer } = shell

  const series = computed(() => getLightNovelTitle(props.data.light_novel))
  const leftOpen = computed(() => (medium.value ? stored.value.left : drawer.value === 'left'))
  const settingsOpen = computed(() =>
    wide.value ? shell.rightDocked.value === 'settings' : drawer.value === 'settings',
  )
</script>

<template>
  <Inline
    as="header"
    :wrap="false"
    align="center"
    gap="sm"
    class="h-13 shrink-0 border-b border-line bg-surface px-3"
  >
    <Heading :level="1" class="sr-only">
      {{ series }} {{ getLightNovelVolumeTitle(data.volume) }}
    </Heading>
    <Inline :wrap="false" align="center" gap="sm" class="min-w-0 flex-1">
      <IconButton
        label="返回分卷详情"
        :as="NuxtLink"
        :to="`/light-novel-volumes/${data.volume.id}`"
      >
        <ArrowLeft aria-hidden="true" />
      </IconButton>
      <Divider orientation="vertical" class="h-5 self-center" />
      <Stack gap="none" align="start" class="min-w-0 flex-1">
        <Text size="xs" tone="faint" truncate class="max-w-full px-2">{{ series }}</Text>
        <LightNovelReaderVolumeMenu :data="data" />
      </Stack>
    </Inline>
    <LightNovelReaderSearchField v-if="data.reader" />
    <Inline :wrap="false" align="center" gap="sm" justify="end" class="flex-1">
      <template v-if="data.reader">
        <LightNovelReaderBookmarkToggle />
        <IconButton
          label="导航"
          data-tour="navigation"
          :variant="leftOpen ? 'soft' : 'ghost'"
          :aria-pressed="leftOpen"
          @click="shell.toggleLeft()"
        >
          <PanelLeft aria-hidden="true" />
        </IconButton>
        <IconButton
          label="阅读设置"
          data-tour="settings"
          :variant="settingsOpen ? 'soft' : 'ghost'"
          :aria-pressed="settingsOpen"
          @click="shell.togglePanel('settings')"
        >
          <Type aria-hidden="true" />
        </IconButton>
        <IconButton
          v-if="settings.device.value.showGuide"
          label="操作指引"
          variant="ghost"
          data-tour="guide"
          @click="tour.start()"
        >
          <CircleQuestionMark aria-hidden="true" />
        </IconButton>
      </template>
    </Inline>
  </Inline>
</template>
