<script setup lang="ts">
  import { Heading, IconButton, Inline, Stack, Text } from '@hina-ui/vue'
  import { ArrowLeft, CircleQuestionMark } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { LightNovelVolumeReaderPageData } from '~~/server/api/pages/light-novel-volumes/[id]/reader.get'
  import { useReader } from '~/features/light-novel-reader/context'
  import { getLightNovelTitle, getLightNovelVolumeTitle } from '~/utils/media/light-novel'

  defineOptions({ name: 'LightNovelReaderPhoneTopBar' })

  const props = defineProps<{ data: LightNovelVolumeReaderPageData }>()

  const { location, settings, tour } = useReader()
  const { title, current } = location
  const series = computed(() => getLightNovelTitle(props.data.light_novel))
</script>

<template>
  <Inline
    as="header"
    :wrap="false"
    align="center"
    gap="xs"
    class="absolute inset-x-0 top-0 z-10 border-b border-line bg-veil px-1 pb-1 backdrop-blur-md"
  >
    <Heading :level="1" class="sr-only">
      {{ series }} {{ getLightNovelVolumeTitle(data.volume) }}
    </Heading>
    <IconButton label="返回分卷详情" :as="NuxtLink" :to="`/light-novel-volumes/${data.volume.id}`">
      <ArrowLeft aria-hidden="true" />
    </IconButton>
    <Stack gap="none" align="start" class="min-w-0 flex-1">
      <LightNovelReaderVolumeMenu :data="data" />
      <Text v-if="title || current" size="xs" tone="muted" truncate class="max-w-full px-3">
        {{ title || current?.label }}
      </Text>
    </Stack>
    <template v-if="data.reader">
      <LightNovelReaderBookmarkToggle />
      <IconButton
        v-if="settings.device.value.showGuide"
        label="操作指引"
        variant="ghost"
        data-tour="guide"
        @click="tour.start()"
      >
        <CircleQuestionMark aria-hidden="true" />
      </IconButton>
      <LightNovelReaderMore />
    </template>
  </Inline>
</template>
