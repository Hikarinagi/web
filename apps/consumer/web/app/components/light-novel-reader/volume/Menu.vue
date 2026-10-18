<script setup lang="ts">
  import {
    Button,
    DisclosureIcon,
    DropdownMenu,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    Inline,
    Text,
  } from '@hina-ui/vue'
  import type { LightNovelVolumeReaderPageData } from '~~/server/api/pages/light-novel-volumes/[id]/reader.get'
  import { useReader } from '~/features/light-novel-reader/context'
  import { getLightNovelVolumeLabel, getLightNovelVolumeTitle } from '~/utils/media/light-novel'

  defineOptions({ name: 'LightNovelReaderVolumeMenu' })

  const props = defineProps<{ data: LightNovelVolumeReaderPageData; size?: 'sm' | 'md' }>()

  const { shell } = useReader()
  const { volumes } = shell

  function nameOf(volume: Parameters<typeof getLightNovelVolumeTitle>[0]) {
    const label = getLightNovelVolumeLabel(volume)
    const title = getLightNovelVolumeTitle(volume)
    return label && label !== title ? [label, title].join(String.fromCharCode(12288)) : title
  }

  const current = computed(() => nameOf(props.data.volume))

  const items = computed(() => {
    const progress = new Map(
      (props.data.reader?.progress.progresses ?? []).map(entry => [entry.volume_id, entry]),
    )
    return props.data.volumes.map(volume => {
      const entry = progress.get(volume.id)
      return {
        id: String(volume.id),
        name: nameOf(volume),
        readable: volume.online_reading_available,
        state: !volume.online_reading_available
          ? '暂无 EPUB'
          : entry?.finished
            ? '已读完'
            : entry && entry.percentage > 0
              ? `${Math.floor(entry.percentage)}%`
              : '',
      }
    })
  })

  const selected = computed({
    get: () => String(props.data.volume.id),
    set: id => {
      if (id !== String(props.data.volume.id)) void navigateTo(`/light-novel-volumes/${id}/read`)
    },
  })
</script>

<template>
  <DropdownMenu v-model:open="volumes" label="切换分卷" align="start">
    <Button
      variant="ghost"
      tone="neutral"
      :size="size ?? 'sm'"
      data-tour="volume"
      class="max-w-full min-w-0"
    >
      <Text as="span" :size="size ?? 'sm'" weight="medium" truncate>{{ current }}</Text>
      <template #trailing><DisclosureIcon /></template>
    </Button>
    <template #content>
      <DropdownMenuRadioGroup v-model="selected">
        <DropdownMenuRadioItem
          v-for="item in items"
          :key="item.id"
          :value="item.id"
          :disabled="!item.readable"
          :text-value="item.name"
        >
          <Inline :wrap="false" justify="between" gap="lg" class="w-full min-w-0">
            <Text as="span" size="sm" truncate>{{ item.name }}</Text>
            <Text v-if="item.state" as="span" size="xs" tone="faint" class="shrink-0 tabular-nums">
              {{ item.state }}
            </Text>
          </Inline>
        </DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </template>
  </DropdownMenu>
</template>
