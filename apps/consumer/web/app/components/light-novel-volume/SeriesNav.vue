<script setup lang="ts">
  import { Inline, PrevNext, PrevNextLink, Text, VisuallyHidden } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { LightNovelVolumePageData } from '~~/server/api/pages/light-novel-volumes/[id].get'
  import {
    getLightNovelVolumeCover,
    getLightNovelVolumeLabel,
    getLightNovelVolumeTitle,
  } from '~/utils/media/light-novel'

  defineOptions({ name: 'LightNovelVolumeSeriesNav' })
  type Sibling = LightNovelVolumePageData['volumes'][number]
  defineProps<{ previous?: Sibling; next?: Sibling }>()

  const labelOf = (v: Sibling) => getLightNovelVolumeLabel(v) || getLightNovelVolumeTitle(v)
  const coverProcessing = { width: 80, quality: 80 } as const
</script>

<template>
  <PrevNext v-if="previous || next" label="分卷导航">
    <PrevNextLink
      v-if="previous"
      :as="NuxtLink"
      :to="`/light-novel-volumes/${previous.id}`"
      direction="prev"
      :label="`上一卷 · ${labelOf(previous)}`"
    >
      <Inline as="span" gap="sm" align="center" :wrap="false" class="min-w-0">
        <HikariImage
          :src="getLightNovelVolumeCover(previous)"
          :alt="getLightNovelVolumeTitle(previous)"
          class="aspect-7/10 w-9 shrink-0 rounded bg-subtle"
          image-class="object-cover"
          :processing="coverProcessing"
        >
          <template #empty><VisuallyHidden /></template>
          <template #error><VisuallyHidden /></template>
        </HikariImage>
        <Text as="span" size="sm" weight="medium" truncate>
          {{ getLightNovelVolumeTitle(previous) }}
        </Text>
      </Inline>
    </PrevNextLink>

    <PrevNextLink
      v-if="next"
      :as="NuxtLink"
      :to="`/light-novel-volumes/${next.id}`"
      direction="next"
      :label="`下一卷 · ${labelOf(next)}`"
    >
      <Inline as="span" gap="sm" align="center" :wrap="false" class="min-w-0 flex-row-reverse">
        <HikariImage
          :src="getLightNovelVolumeCover(next)"
          :alt="getLightNovelVolumeTitle(next)"
          class="aspect-7/10 w-9 shrink-0 rounded bg-subtle"
          image-class="object-cover"
          :processing="coverProcessing"
        >
          <template #empty><VisuallyHidden /></template>
          <template #error><VisuallyHidden /></template>
        </HikariImage>
        <Text as="span" size="sm" weight="medium" truncate>
          {{ getLightNovelVolumeTitle(next) }}
        </Text>
      </Inline>
    </PrevNextLink>
  </PrevNext>
</template>
