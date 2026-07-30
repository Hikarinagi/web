<script setup lang="ts">
  defineOptions({ name: 'LightNovelsPage' })
  definePageMeta({ container: 'full' })

  const { data } = await useHikariApiData('/api/pages/light-novels', { fatal: true })

  useHikariSeoMeta({
    title: '轻小说在线阅读',
    description: () =>
      '免费在线阅读轻小说，收录轻小说系列、文库、作者与各卷发售信息，支持章节在线阅读。',
  })
</script>

<template>
  <div v-if="data" :class="data.hero ? '-mt-(--app-header-height)' : ''">
    <LightNovelExploreHero v-if="data.hero" :hero="data.hero" />

    <div class="mx-auto box-content flex max-w-app flex-col gap-14 px-6 py-12">
      <LightNovelExploreSeriesRail
        title="现在就能读完"
        meta="已完结的轻小说系列"
        :to="'/light-novels/browse?status=finished&readable=1'"
        :items="data.completed_readable.items"
      />
      <LightNovelExploreRanking :items="data.ranking.items" />
      <LightNovelExploreSeriesRail
        title="短篇速通"
        meta="1–3 卷 · 一两天就读完一部"
        :items="data.short_series.items"
      />
      <LightNovelExploreBunkoNav :bunko="data.stats.top_bunko" />
      <LightNovelExploreSeriesRail
        title="完结不挖坑"
        meta="已完结,放心入坑"
        to="/light-novels/browse?status=finished"
        :items="data.completed.items"
      />
      <LightNovelExploreSeriesRail title="即将发售" meta="新作开载" :items="data.upcoming.items" />
      <LightNovelExploreAuthorSpotlight
        v-if="data.author_spotlight"
        :spotlight="data.author_spotlight"
      />
      <LightNovelExploreBunkoPicks :picks="data.bunko_picks" />
      <LightNovelExploreSeriesUniverse
        v-if="data.series_spotlight"
        :spotlight="data.series_spotlight"
      />
      <LightNovelExploreSeriesRail
        title="最新收录"
        meta="近期上架到书库"
        to="/light-novels/browse?sort=created_at:desc"
        :items="data.recent.items"
      />

      <LightNovelExploreInfiniteRails />
    </div>
  </div>
</template>
