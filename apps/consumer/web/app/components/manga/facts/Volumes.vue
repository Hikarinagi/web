<script setup lang="ts">
  import { Button as HnButton, Stack, Text } from '@hina-ui/vue'
  import { mangaSetName } from '@hikarinagi/shared'
  import type { MangaPageData } from '~~/server/api/pages/mangas/[id].get'
  import { dayText } from '~/features/entry/date'
  import { volumeSetLabel } from '~/features/manga/sets'

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
          name: mangaSetName(set),
          volumes: set.volumes,
        }))
      : [{ key: 0, label: `${props.volumes.length} 卷`, name: '', volumes: props.volumes }],
  )
  const latest = (volumes: MangaPageData['volumes']) =>
    volumes.findLast(volume => volume.publication_date)?.publication_date ?? null
  const open = ref(false)
  const shownKey = ref<number | null>(null)
  const chosen = computed(() => groups.value.find(group => group.key === shownKey.value))
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
    <MangaVolumeDrawer v-model:open="open" :volumes="chosen?.volumes ?? []" :set="chosen?.name" />
  </Stack>
</template>
