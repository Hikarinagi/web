<script setup lang="ts">
  import { Inline, Stack, Text } from '@hina-ui/vue'
  import type { MangaReadingUnit } from '@hikarinagi/shared'
  import type { ContentsItem, ContentsUnits, ContentsVariant } from '~/features/manga/contents'
  import { contentsGroups } from '~/features/manga/sets'

  defineOptions({ name: 'MangaContentsUnit' })

  const props = withDefaults(
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
    }>(),
    {
      currentPage: 0,
      desc: false,
      variant: 'page',
      collecting: () => new Set<number>(),
    },
  )
  const emit = defineEmits<{ select: [item: ContentsItem] }>()
  const range = defineModel<string | null>('range', { default: null })

  const groups = computed(() => contentsGroups(props.units.volume))
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
  <Stack v-else-if="unit === 'volume'" gap="xl">
    <Stack v-for="group in groups" :key="group.key" gap="sm">
      <Inline v-if="groups.length > 1" gap="sm" align="baseline">
        <Text weight="medium">{{ group.name }}</Text>
        <Text size="sm" tone="muted" class="tabular-nums">{{ group.items.length }} 卷</Text>
      </Inline>
      <Text v-else-if="!group.original" size="sm" tone="muted">目录中的卷为{{ group.name }}</Text>
      <MangaContentsVolumeGrid
        :volumes="group.items"
        :current-id="currentId"
        :current-page="currentPage"
        :read-ids="readIds"
        :signed-in="signedIn"
        :desc="desc"
        :variant="variant"
        @select="emit('select', $event)"
      />
    </Stack>
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
