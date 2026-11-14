<script setup lang="ts">
  import { Text } from '@hina-ui/vue'
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
    <RankingRow
      v-for="row in rows"
      :key="row.item.id"
      :to="row.work.to"
      :rank="row.item.rank"
      :previous="row.item.previous"
      :title="row.work.title"
      :original="row.work.original"
      :cover="row.work.cover"
      :intro="row.item.intro"
    >
      <template #meta>
        <Text v-if="row.work.sub" size="xs" tone="muted" truncate lang="ja" class="min-w-0">
          {{ row.work.sub }}
        </Text>
        <Text v-if="row.item.bunko" size="xs" tone="faint" truncate lang="ja" class="min-w-0">
          {{ row.item.bunko.name }}
        </Text>
      </template>
      <template v-if="row.rated || row.item.volume_count || row.status" #aside>
        <LandingScore
          v-if="row.rated"
          :score="row.rated.average!"
          :rated="row.rated.count"
          class="shrink-0"
        />
        <Text v-if="row.item.volume_count" size="xs" tone="muted" class="shrink-0 tabular-nums">
          {{ row.item.volume_count }} 卷
        </Text>
        <Text v-if="row.status" size="xs" tone="faint" class="shrink-0">{{ row.status }}</Text>
      </template>
    </RankingRow>
  </RankingShell>
</template>
