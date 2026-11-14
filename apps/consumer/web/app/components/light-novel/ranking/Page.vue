<script setup lang="ts">
  import { Tag, Text } from '@hina-ui/vue'
  import type { LightNovelsRankingPageData } from '~~/server/api/pages/light-novels/ranking.get'
  import { novelWork } from '~/features/landing/works'
  import { statusText } from '~/features/light-novel/explore'
  import type { RankingPeriod } from '~/features/ranking/ranking'

  defineOptions({ name: 'LightNovelRankingPage' })
  const props = defineProps<{
    ranking: LightNovelsRankingPageData['ranking']
    pending?: boolean
  }>()
  const emit = defineEmits<{ update: [period: RankingPeriod] }>()

  const rows = computed(() =>
    props.ranking.items.map(item => ({
      item,
      work: novelWork(item),
      status: statusText(item.novel_status),
      rated: item.rating.count >= 3 && item.rating.average !== null ? item.rating : null,
    })),
  )
</script>

<template>
  <RankingShell
    title="轻小说排行榜"
    :period="ranking.period"
    :from="ranking.from"
    :to="ranking.to"
    :count="rows.length"
    :pending="pending"
    @update="emit('update', $event)"
  >
    <RankingTile
      v-for="row in rows"
      :key="row.item.id"
      :to="row.work.to"
      :rank="row.item.rank"
      :previous="row.item.previous"
      :title="row.work.title"
      :original="row.work.original"
      :sub="row.work.sub"
      :cover="row.work.cover"
      :intro="row.item.intro"
    >
      <template #detail>
        <Tag v-if="row.status" size="sm" tone="neutral" class="shrink-0">{{ row.status }}</Tag>
        <Text
          v-if="row.item.volume_count"
          size="sm"
          tone="muted"
          truncate
          class="min-w-0 tabular-nums"
        >
          共 {{ row.item.volume_count }} 卷
        </Text>
      </template>
      <template #facts>
        <LightNovelRankingFacts
          :rated="row.rated"
          :author="row.work.sub"
          :bunko="row.item.bunko?.name"
          :volumes="row.item.volume_count"
          :status="row.status"
        />
      </template>
    </RankingTile>
  </RankingShell>
</template>
