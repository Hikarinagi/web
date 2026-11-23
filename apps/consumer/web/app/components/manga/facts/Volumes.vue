<script setup lang="ts">
  import { Button as HnButton, Stack, Text } from '@hina-ui/vue'
  import { volumeSetName } from '@hikarinagi/shared'
  import type { MangaPageData } from '~~/server/api/pages/mangas/[id].get'
  import { dayText } from '~/features/entry/date'
  import { effectiveVolumeNumber } from '~/features/manga/volumes'
  import { volumeDrawerMeta, volumeSetLabel } from '~/features/volume-set/sets'

  defineOptions({ name: 'MangaFactsVolumes' })
  const props = defineProps<{
    volumes: MangaPageData['volumes']
    sets: MangaPageData['sets']
  }>()

  const groups = computed(() =>
    props.sets.length > 1
      ? props.sets.map(set => ({
          key: set.id,
          label: volumeSetLabel(set),
          name: volumeSetName(set),
          volumes: set.volumes,
        }))
      : [{ key: 0, label: `${props.volumes.length} 卷`, name: '', volumes: props.volumes }],
  )
  const latest = (volumes: MangaPageData['volumes']) =>
    volumes.findLast(volume => volume.publication_date)?.publication_date ?? null
  const open = ref(false)
  const shownKey = ref<number | null>(null)
  const chosen = computed(() => groups.value.find(group => group.key === shownKey.value))
  const rows = computed(() =>
    (chosen.value?.volumes ?? []).map((entry, _, list) => {
      const number = effectiveVolumeNumber(entry, list)
      const name = entry.name_cn || entry.name || ''
      return {
        id: entry.id,
        to: `/manga-volumes/${entry.id}`,
        cover: entry.display_cover,
        label: number != null ? `第 ${number} 卷` : name || '单行本',
        name: number != null ? name : '',
        meta: volumeDrawerMeta(entry),
      }
    }),
  )
</script>

<template>
  <Stack gap="xs">
    <Stack v-for="group in groups" :key="group.key" gap="none">
      <HnButton
        variant="link"
        size="sm"
        class="self-start"
        @click="((shownKey = group.key), (open = true))"
      >
        {{ group.label }}
      </HnButton>
      <Text v-if="latest(group.volumes)" as="span" size="sm" tone="muted" class="tabular-nums">
        最新一卷 {{ dayText(latest(group.volumes)) }}
      </Text>
    </Stack>
    <EntryVolumeDrawer
      v-model:open="open"
      title="单行本"
      :description="chosen?.name ? `${chosen.name} ${rows.length} 卷` : `${rows.length} 卷`"
      :rows="rows"
    />
  </Stack>
</template>
