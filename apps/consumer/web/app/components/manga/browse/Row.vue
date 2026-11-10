<script setup lang="ts">
  import { Text } from '@hina-ui/vue'
  import { statusText, type MangaListItem } from '~/features/manga/explore'
  import { dateText } from '~/features/wiki/values'
  import { topVotedMedia } from '~/utils/media/image'

  defineOptions({ name: 'MangaBrowseRow' })
  const props = defineProps<{ item: MangaListItem }>()

  const latest = computed(() =>
    props.item.latest_volume_date
      ? dateText(String(props.item.latest_volume_date).slice(0, 10), 'DAY')
      : null,
  )
  const rated = computed(() => {
    const { average, count } = props.item.rating
    return count >= 3 && average !== null ? { average, count } : null
  })
</script>

<template>
  <BrowseRow
    :to="`/mangas/${item.id}`"
    :title="item.name_cn || item.name"
    :original="item.name_cn ? item.name : undefined"
    :cover="topVotedMedia(item.covers)"
    ratio="2/3"
  >
    <template #meta>
      <Text v-if="item.author" size="xs" tone="muted" truncate lang="ja" class="min-w-0">
        {{ item.author.name }}
      </Text>
      <Text v-if="item.label" size="xs" tone="faint" truncate lang="ja" class="min-w-0">
        {{ item.label.name }}
      </Text>
    </template>
    <template v-if="rated || item.volume_count || latest || item.serial_status" #extra>
      <LandingScore v-if="rated" :score="rated.average" :rated="rated.count" class="shrink-0" />
      <Text v-if="item.volume_count" size="xs" tone="muted" class="shrink-0 tabular-nums">
        {{ item.volume_count }} 卷
      </Text>
      <Text v-if="latest" size="xs" tone="muted" class="shrink-0 tabular-nums">
        <Text as="span" size="xs" tone="muted" class="max-sm:hidden">最新一卷 </Text>{{ latest }}
      </Text>
      <Text v-if="item.serial_status" size="xs" tone="muted" truncate class="min-w-0">
        {{ statusText(item.serial_status) }}
      </Text>
    </template>
  </BrowseRow>
</template>
