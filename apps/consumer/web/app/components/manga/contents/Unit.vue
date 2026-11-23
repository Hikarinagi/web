<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import type { MangaReadingUnit } from '@hikarinagi/shared'
  import type { ContentsItem, ContentsUnits, ContentsVariant } from '~/features/manga/contents'
  import type { ContentsSetOption } from '~/features/manga/sets'

  defineOptions({ name: 'MangaContentsUnit' })

  withDefaults(
    defineProps<{
      unit: MangaReadingUnit
      units: ContentsUnits
      currentId: number | null
      currentPage?: number
      readIds: ReadonlySet<number>
      signedIn: boolean
      desc?: boolean
      variant?: ContentsVariant
      collecting?: ReadonlySet<number>
      sets?: ContentsSetOption[]
    }>(),
    {
      currentPage: 0,
      desc: false,
      variant: 'page',
      collecting: () => new Set<number>(),
      sets: () => [],
    },
  )
  const emit = defineEmits<{ select: [item: ContentsItem] }>()
  const range = defineModel<string | null>('range', { default: null })
  const set = defineModel<number | null>('set', { default: null })
</script>

<template>
  <MangaContentsChapterGrid
    v-if="unit === 'chapter'"
    v-model:range="range"
    :chapters="units.chapter"
    :current-id="currentId"
    :current-page="currentPage"
    :read-ids="readIds"
    :signed-in="signedIn"
    :desc="desc"
    :variant="variant"
    :collecting="collecting"
    @select="emit('select', $event)"
  />
  <Stack v-else-if="unit === 'volume'" gap="md">
    <MangaContentsSetSwitch v-if="sets.length" v-model="set" :options="sets" />
    <MangaContentsVolumeGrid
      :volumes="units.volume"
      :current-id="currentId"
      :current-page="currentPage"
      :read-ids="readIds"
      :signed-in="signedIn"
      :desc="desc"
      :variant="variant"
      @select="emit('select', $event)"
    />
  </Stack>
  <MangaContentsExtraList
    v-else
    :extras="units.extra"
    :current-id="currentId"
    :current-page="currentPage"
    :read-ids="readIds"
    :signed-in="signedIn"
    :desc="desc"
    :columns="variant === 'page' ? 2 : 1"
    @select="emit('select', $event)"
  />
</template>
