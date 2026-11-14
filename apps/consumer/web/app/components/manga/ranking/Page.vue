<script setup lang="ts">
  import { Text } from '@hina-ui/vue'
  import type { MangasRankingPageData } from '~~/server/api/pages/mangas/ranking.get'
  import { chapterLabel, dayLabel, daysBetween } from '~/features/landing/labels'
  import { mangaWork } from '~/features/landing/works'
  import { mangaSerialStatusLabel } from '~/features/manga/labels'
  import type { RankingPeriod } from '~/features/ranking/ranking'

  defineOptions({ name: 'MangaRankingPage' })
  const props = defineProps<{ ranking: MangasRankingPageData['ranking']; pending?: boolean }>()
  const emit = defineEmits<{ update: [period: RankingPeriod] }>()

  const rows = computed(() =>
    props.ranking.items.map(item => {
      const day = item.chapter?.at.slice(0, 10)
      const ago = day ? daysBetween(day, props.ranking.to) + 1 : null
      return {
        item,
        work: mangaWork(item),
        status: mangaSerialStatusLabel(item.serial_status),
        chapter: chapterLabel(item.chapter),
        updated:
          day && ago !== null && ago < 30
            ? `${ago <= 0 ? '今天' : ago === 1 ? '昨天' : dayLabel(day)}更新`
            : '',
        rated: item.rating.count >= 3 && item.rating.average !== null ? item.rating : null,
      }
    }),
  )
</script>

<template>
  <RankingShell
    title="漫画排行榜"
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
        <Text v-if="row.status" size="xs" tone="muted" class="shrink-0">{{ row.status }}</Text>
      </template>
      <template v-if="row.rated || row.chapter" #aside>
        <LandingScore
          v-if="row.rated"
          :score="row.rated.average!"
          :rated="row.rated.count"
          class="shrink-0"
        />
        <Text v-if="row.chapter" size="xs" tone="muted" truncate class="max-w-full tabular-nums">
          {{ row.chapter }}
        </Text>
        <Text v-if="row.updated" size="xs" tone="faint" class="shrink-0 tabular-nums max-md:hidden">
          {{ row.updated }}
        </Text>
      </template>
    </RankingRow>
  </RankingShell>
</template>
