<script setup lang="ts">
  import { Inline, Text } from '@hina-ui/vue'
  import { BookOpen } from '@lucide/vue'
  import { statusText, type LightNovelSummary } from '~/features/light-novel/explore'
  import { dateText } from '~/features/wiki/values'
  import { topVotedMedia } from '~/utils/media/image'

  defineOptions({ name: 'LightNovelBrowseRow' })
  const props = defineProps<{ item: LightNovelSummary }>()

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
    :to="`/light-novels/${item.id}`"
    :title="item.name_cn || item.name"
    :original="item.name_cn ? item.name : undefined"
    :cover="topVotedMedia(item.covers)"
    ratio="2/3"
  >
    <template #meta>
      <Text v-if="item.author" size="xs" tone="muted" truncate lang="ja" class="min-w-0">
        {{ item.author.name }}
      </Text>
      <Text v-if="item.bunko" size="xs" tone="faint" truncate lang="ja" class="min-w-0">
        {{ item.bunko.name }}
      </Text>
    </template>
    <template #extra>
      <Inline
        v-if="item.readable"
        gap="xs"
        align="center"
        :wrap="false"
        class="shrink-0 text-accent-text"
      >
        <BookOpen class="size-3.5" />
        <Text as="span" size="xs" tone="accent" class="max-sm:sr-only">可在站内阅读</Text>
      </Inline>
      <LandingScore v-if="rated" :score="rated.average" :rated="rated.count" class="shrink-0" />
      <Text v-if="item.volume_count" size="xs" tone="muted" class="shrink-0 tabular-nums">
        {{ item.volume_count }} 卷
      </Text>
      <Text v-if="latest" size="xs" tone="muted" class="shrink-0 tabular-nums">
        <Text as="span" size="xs" tone="muted" class="max-sm:hidden">最新一卷 </Text>{{ latest }}
      </Text>
      <Text v-if="item.novel_status" size="xs" tone="muted" truncate class="min-w-0">
        {{ statusText(item.novel_status) }}
      </Text>
    </template>
  </BrowseRow>
</template>
