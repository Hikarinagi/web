<script setup lang="ts">
  import { Text } from '@hina-ui/vue'
  import type { GalgamesCalendarPageData } from '~~/server/api/pages/galgames/calendar.get'
  import { ageRatingLabel } from '~/features/entry/labels'
  import { platformLabel, sortPlatforms } from '~/features/galgame/platforms'
  import { yenLabel } from '~/features/landing/labels'
  import { galgameWork } from '~/features/landing/works'

  defineOptions({ name: 'GalgameCalendarItem' })
  const props = defineProps<{ item: GalgamesCalendarPageData['calendar']['items'][number] }>()

  const work = computed(() => galgameWork(props.item))
  const platforms = computed(() =>
    sortPlatforms(props.item.platforms).map(platformLabel).join('、'),
  )
  const age = computed(() =>
    props.item.age_rating === 'R18' ? null : ageRatingLabel(props.item.age_rating),
  )
</script>

<template>
  <BrowseRow
    :to="work.to"
    :title="work.title"
    :original="work.original"
    :cover="work.cover"
    ratio="3/4"
  >
    <template v-if="work.sub" #meta>
      <Text size="xs" tone="muted" truncate lang="ja" class="min-w-0">{{ work.sub }}</Text>
    </template>
    <template v-if="platforms || age || item.price" #extra>
      <Text v-if="platforms" size="xs" tone="muted" truncate class="min-w-0">{{ platforms }}</Text>
      <Text v-if="age" size="xs" tone="muted" class="shrink-0">{{ age }}</Text>
      <Text v-if="item.price" size="xs" tone="muted" class="shrink-0 tabular-nums">
        {{ yenLabel(item.price) }}
      </Text>
    </template>
  </BrowseRow>
</template>
