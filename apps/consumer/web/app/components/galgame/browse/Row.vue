<script setup lang="ts">
  import { Tag, Text } from '@hina-ui/vue'
  import type { GalgameSummary } from '~/features/galgame/explore'
  import { platformLabel } from '~/features/galgame/platforms'
  import { dateText } from '~/features/wiki/values'
  import { topVotedMedia } from '~/utils/media/image'

  defineOptions({ name: 'GalgameBrowseRow' })
  const props = defineProps<{ item: GalgameSummary }>()

  const maker = computed(
    () => props.item.producers.find(row => !row.role || row.role === 'DEVELOPER')?.producer.name,
  )
  const date = computed(() =>
    props.item.release_date
      ? dateText(String(props.item.release_date).slice(0, 10), props.item.release_date_precision)
      : null,
  )
  const platforms = computed(() => props.item.platforms.slice(0, 3).map(platformLabel).join('、'))
  const rated = computed(() => {
    const { average, count } = props.item.rating
    return count >= 3 && average !== null ? { average, count } : null
  })
</script>

<template>
  <BrowseRow
    :to="`/galgames/${item.id}`"
    :title="item.trans_title || item.origin_title"
    :original="item.trans_title ? item.origin_title : undefined"
    :cover="topVotedMedia(item.covers)"
    ratio="3/4"
  >
    <template #meta>
      <Text v-if="maker" size="xs" tone="muted" truncate lang="ja" class="min-w-0">{{
        maker
      }}</Text>
      <Text v-if="date" size="xs" tone="muted" class="shrink-0 tabular-nums">{{ date }}</Text>
      <Text v-if="platforms" size="xs" tone="muted" truncate class="min-w-0 max-sm:hidden">
        {{ platforms }}
      </Text>
    </template>
    <template v-if="rated || item.tags.length" #extra>
      <LandingScore v-if="rated" :score="rated.average" :rated="rated.count" class="shrink-0" />
      <Tag v-for="tag in item.tags" :key="tag.id" size="sm" variant="soft" tone="neutral">
        {{ tag.name }}
      </Tag>
    </template>
  </BrowseRow>
</template>
