<script setup lang="ts">
  import { Tabs, TabsContent, TabsList, TabsTrigger, Text } from '@hina-ui/vue'
  import {
    MANGA_READING_UNITS,
    MANGA_READING_UNIT_NAME,
    type MangaReadingUnit,
  } from '@hikarinagi/shared'
  import type { ContentsItem, ContentsUnits, ContentsVariant } from '~/features/manga/contents'

  defineOptions({ name: 'MangaContentsBrowser' })

  const props = withDefaults(
    defineProps<{
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
  const unit = defineModel<MangaReadingUnit>('unit', { required: true })
  const range = defineModel<string | null>('range', { default: null })

  const available = computed(() => MANGA_READING_UNITS.filter(key => props.units[key].length))
</script>

<template>
  <Tabs
    v-if="available.length > 1"
    :model-value="unit"
    variant="underline"
    @update:model-value="unit = ($event as MangaReadingUnit) ?? unit"
  >
    <TabsList label="阅读单位">
      <TabsTrigger v-for="key in available" :key="key" :value="key">
        {{ MANGA_READING_UNIT_NAME[key] }}
        <Text as="span" size="sm" tone="faint" class="tabular-nums">
          {{ units[key].length }}
        </Text>
      </TabsTrigger>
    </TabsList>
    <TabsContent v-for="key in available" :key="key" :value="key">
      <MangaContentsUnit
        v-model:range="range"
        :unit="key"
        :units="units"
        :current-id="currentId"
        :current-page="currentPage"
        :read-ids="readIds"
        :signed-in="signedIn"
        :desc="desc"
        :variant="variant"
        class="pt-4"
        @select="emit('select', $event)"
      />
    </TabsContent>
  </Tabs>
  <MangaContentsUnit
    v-else-if="available[0]"
    v-model:range="range"
    :unit="available[0]"
    :units="units"
    :current-id="currentId"
    :current-page="currentPage"
    :read-ids="readIds"
    :signed-in="signedIn"
    :desc="desc"
    :variant="variant"
    @select="emit('select', $event)"
  />
</template>
