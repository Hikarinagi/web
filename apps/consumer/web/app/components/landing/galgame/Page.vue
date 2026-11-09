<script setup lang="ts">
  import { Grid, Stack, VisuallyHidden } from '@hina-ui/vue'
  import { ListChecks } from '@lucide/vue'
  import type { GalgamesPageData } from '~~/server/api/pages/galgames.get'
  import { galgameWork } from '~/features/landing/works'

  defineOptions({ name: 'LandingGalgamePage' })
  const props = defineProps<{ data: GalgamesPageData }>()

  const recording = ref(false)

  const charts = computed(() =>
    [
      {
        title: '在玩人数最多',
        rows: props.data.playing.map(item => ({
          work: galgameWork(item),
          note: `${item.people} 人在玩`,
        })),
      },
      {
        title: '评分最高',
        rows: props.data.rated.map(item => ({
          work: galgameWork(item),
          score: item.score,
          rated: item.people,
        })),
      },
    ].filter(chart => chart.rows.length),
  )
</script>

<template>
  <Stack gap="none" class="-mt-(--app-header-height) pb-16">
    <VisuallyHidden as="h1">Galgame</VisuallyHidden>
    <LandingReleaseStage v-if="data.schedule.length" :items="data.schedule" :today="data.today" />
    <Stack
      gap="none"
      :class="
        cn(
          'mx-auto w-full max-w-(--entry-container) gap-12 px-4 lg:px-6',
          !data.schedule.length && 'pt-(--landing-stage-top)',
        )
      "
    >
      <LandingSection v-if="data.hot.length" title="本周热门">
        <LandingPodiumGame :items="data.hot" />
      </LandingSection>
      <LandingSection
        v-for="row in data.similar"
        :key="row.ref.id"
        :title="`与《${row.ref.title}》相似`"
      >
        <LandingSimilar :works="row.items.map(galgameWork)" ratio="3/4" />
      </LandingSection>
      <Grid
        v-if="charts.length"
        gap="xl"
        :class="charts.length > 1 ? 'lg:grid-cols-2 lg:gap-x-10' : ''"
      >
        <LandingSection v-for="chart in charts" :key="chart.title" :title="chart.title">
          <LandingChart :rows="chart.rows" ratio="3/4" :wide="charts.length === 1" />
        </LandingSection>
      </Grid>
      <LandingSection title="为你推荐">
        <template #actions>
          <Button variant="ghost" tone="neutral" size="sm" login-required @click="recording = true">
            <template #icon><ListChecks /></template>
            记录玩过的游戏
          </Button>
        </template>
        <LandingFeed
          :key="data.feed.cursor ?? 'end'"
          path="/api/v3/landing/galgames/feed"
          :initial="data.feed"
          :banners="data.banners"
          kind="galgame"
        />
      </LandingSection>
      <GalgameExploreRecordDialog v-model:visible="recording" />
    </Stack>
  </Stack>
</template>
