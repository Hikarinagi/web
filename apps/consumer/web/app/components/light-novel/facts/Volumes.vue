<script setup lang="ts">
  import { Button as HnButton, Stack, Text } from '@hina-ui/vue'
  import type { LightNovelPageData } from '~~/server/api/pages/light-novels/[id].get'
  import { monthText } from '~/features/entry/date'
  import { volumeDrawerMeta, volumeSetLabel } from '~/features/volume-set/sets'
  import { getLightNovelVolumeLabel } from '~/utils/media/light-novel'

  type VolumeSet = LightNovelPageData['sets'][number]

  defineOptions({ name: 'LightNovelFactsVolumes' })
  const props = defineProps<{ sets: LightNovelPageData['sets'] }>()

  const span = (set: VolumeSet) => {
    const first = set.volumes.find(volume => volume.publication_date)
    const last = set.volumes.findLast(volume => volume.publication_date)
    if (!first || !last) return ''
    const from = monthText(first.publication_date, first.publication_date_precision)
    const to = monthText(last.publication_date, last.publication_date_precision)
    return from === to ? from : `${from}至 ${to}`
  }
  const open = ref(false)
  const shownId = ref<number | null>(null)
  const chosen = computed(() => props.sets.find(set => set.id === shownId.value))
  const rows = computed(() =>
    (chosen.value?.volumes ?? []).map(volume => {
      const label = getLightNovelVolumeLabel({ ...volume, volume_set: null })
      const name = volume.name_cn || volume.name || ''
      return {
        id: volume.id,
        to: `/light-novel-volumes/${volume.id}`,
        cover: volume.display_cover,
        label: label ?? (name || '单行本'),
        name: label ? name : '',
        meta: volumeDrawerMeta(volume),
      }
    }),
  )
</script>

<template>
  <Stack gap="xs">
    <Stack v-for="set in sets" :key="set.id" gap="none">
      <HnButton
        variant="link"
        size="sm"
        class="self-start"
        @click="((shownId = set.id), (open = true))"
      >
        {{ volumeSetLabel(set) }}
      </HnButton>
      <Text v-if="span(set)" as="span" size="sm" tone="muted" class="tabular-nums">
        {{ span(set) }}
      </Text>
    </Stack>
    <EntryVolumeDrawer
      v-model:open="open"
      title="单行本"
      :description="chosen ? volumeSetLabel(chosen) : ''"
      :rows="rows"
    />
  </Stack>
</template>
