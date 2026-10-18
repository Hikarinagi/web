<script setup lang="ts">
  import type { MangaReadingUnit } from '@hikarinagi/shared'
  import type { ContentsItem, ContentsUnits, ContentsVariant } from '~/features/manga/contents'

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
    }>(),
    { currentPage: 0, desc: false, variant: 'page' },
  )
  const emit = defineEmits<{ select: [item: ContentsItem] }>()
  const range = defineModel<string | null>('range', { default: null })
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
    @select="emit('select', $event)"
  />
  <MangaContentsVolumeGrid
    v-else-if="unit === 'volume'"
    :volumes="units.volume"
    :current-id="currentId"
    :current-page="currentPage"
    :read-ids="readIds"
    :signed-in="signedIn"
    :desc="desc"
    :variant="variant"
    @select="emit('select', $event)"
  />
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
