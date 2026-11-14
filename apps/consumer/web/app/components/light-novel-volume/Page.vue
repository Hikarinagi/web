<script setup lang="ts">
  import { LineClamp, Stack, Text } from '@hina-ui/vue'
  import type { LightNovelVolumePageData } from '~~/server/api/pages/light-novel-volumes/[id].get'
  import { usePageTone } from '~/features/entry/usePageTone'
  import { getRevisionEditPath } from '~/features/revision/resources'

  defineOptions({ name: 'LightNovelVolumePage' })
  const props = defineProps<{ data: LightNovelVolumePageData; volumeId: number }>()
  const emit = defineEmits<{
    progressChange: [NonNullable<LightNovelVolumePageData['progresses']>]
  }>()

  const index = computed(() =>
    props.data.volumes.findIndex(volume => volume.id === props.data.volume.id),
  )
  const previous = computed(() =>
    index.value > 0 ? props.data.volumes[index.value - 1] : undefined,
  )
  const next = computed(() => (index.value >= 0 ? props.data.volumes[index.value + 1] : undefined))

  const hash = computed(() => props.data.volume.display_cover?.thumb_hash ?? null)
  usePageTone(hash, { paper: true })

  const summary = computed(() =>
    (props.data.volume.summary_cn || props.data.volume.summary || '').replace(/\r/g, ''),
  )
  const original = computed(
    () => !props.data.volume.summary_cn && Boolean(props.data.volume.summary),
  )
  const external = computed(() =>
    props.data.volume.bangumi_book_id
      ? [
          {
            label: 'Bangumi',
            href: `https://bgm.tv/subject/${props.data.volume.bangumi_book_id}`,
          },
        ]
      : [],
  )

  useEventListener('keydown', event => {
    const target = event.target as HTMLElement | null
    if (event.altKey || event.ctrlKey || event.metaKey) return
    if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return
    if (target?.isContentEditable) return
    if (event.key === 'ArrowLeft' && previous.value)
      void navigateTo(`/light-novel-volumes/${previous.value.id}`)
    if (event.key === 'ArrowRight' && next.value)
      void navigateTo(`/light-novel-volumes/${next.value.id}`)
  })
</script>

<template>
  <Stack gap="none" class="min-h-screen bg-canvas">
    <LightNovelVolumeHero
      :volume="data.volume"
      :light-novel="data.light_novel"
      :people="data.people"
      :progress="data.progress"
      :my-rate="data.my_rate"
      :index="Math.max(index, 0)"
      :total="data.volumes.length"
      :previous="previous"
      :next="next"
      @progress-change="emit('progressChange', $event)"
    />
    <Stack
      gap="xl"
      class="mx-auto w-full max-w-(--entry-container) px-4 py-10 lg:grid lg:grid-cols-[minmax(0,1fr)_var(--rail-right)] lg:items-start lg:gap-10 lg:px-6"
    >
      <Stack gap="none" class="min-w-0 gap-12">
        <Stack gap="md">
          <EntrySectionHead id="intro" title="简介" />
          <LineClamp v-if="summary" :lines="6" expand-label="展开" collapse-label="收起">
            <Text
              :lang="original ? 'ja' : undefined"
              class="leading-relaxed wrap-anywhere whitespace-pre-line"
            >
              {{ summary }}
            </Text>
          </LineClamp>
          <WorkIntro v-else :edit-to="getRevisionEditPath('light-novel-volume', volumeId)" />
        </Stack>
        <Stack gap="md">
          <LightNovelVolumeEditions :volume="data.volume" :producers="data.producers" />
        </Stack>
        <Stack v-if="data.volumes.length" gap="md">
          <LightNovelVolumeSeriesStrip :volumes="data.volumes" :current="data.volume.id" />
        </Stack>
      </Stack>
      <Stack as="aside" gap="xl" class="lg:sticky lg:top-[calc(var(--app-header-height)+1.5rem)]">
        <LightNovelVolumeFacts
          :volume="data.volume"
          :light-novel="data.light_novel"
          :people="data.people"
          :producers="data.producers"
        />
        <EntryMeta
          :contributors="data.contributors"
          resource-type="light-novel-volume"
          :resource-id="volumeId"
          :external="external"
          :views="data.volume.views"
        />
      </Stack>
    </Stack>
  </Stack>
</template>
