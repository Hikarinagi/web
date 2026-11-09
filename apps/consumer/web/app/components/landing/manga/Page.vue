<script setup lang="ts">
  import { Grid, Stack, VisuallyHidden } from '@hina-ui/vue'
  import type { MangasPageData } from '~~/server/api/pages/mangas.get'
  import { chapterLabel, dayLabel, daysBetween, relativeDay } from '~/features/landing/labels'
  import { mangaWork } from '~/features/landing/works'

  defineOptions({ name: 'LandingMangaPage' })
  const props = defineProps<{ data: MangasPageData }>()

  const since = (at: string) => {
    const days = daysBetween(at.slice(0, 10), props.data.today)
    return days <= 0 ? '今天' : `${days} 天前`
  }
  const lead = computed(() =>
    [
      {
        title: '已读作品更新',
        items: props.data.updated.map(item => ({
          work: mangaWork(item),
          to: item.chapter ? `/mangas/${item.id}/read/${item.chapter.id}` : `/mangas/${item.id}`,
          chapter: chapterLabel(item.chapter),
          note: item.chapter
            ? `${relativeDay(item.chapter.at.slice(0, 10), props.data.today)}更新`
            : '',
        })),
      },
      {
        title: '继续阅读',
        items: props.data.reading.map(item => ({
          work: {
            id: item.manga_id,
            to: `/mangas/${item.manga_id}`,
            title: item.title,
            sub: item.author ?? '',
            cover: item.cover,
          },
          to: `/mangas/${item.manga_id}/read/${item.current_chapter_id}`,
          chapter: chapterLabel({
            type: item.current_chapter_type,
            number: item.current_chapter_number,
            title: item.current_chapter_title,
          }),
          note: `上次阅读：${since(item.last_read)}`,
          progress: item.total_chapters
            ? Math.min(1, item.current_chapter_index / item.total_chapters)
            : undefined,
        })),
      },
    ].filter(row => row.items.length),
  )
  const hot = computed(() =>
    props.data.hot.map(item => ({ work: mangaWork(item), detail: chapterLabel(item.chapter) })),
  )
  const charts = computed(() =>
    [
      {
        title: '新连载',
        rows: props.data.serials.map(item => ({
          work: mangaWork(item),
          note: item.publication_date
            ? `${dayLabel(item.publication_date.slice(0, 10))}开始连载`
            : '',
        })),
      },
      {
        title: '热门完结作品',
        rows: props.data.finished.map(item => ({
          work: mangaWork(item),
          note: item.chapters ? `共 ${item.chapters} 话` : '',
        })),
      },
    ].filter(chart => chart.rows.length),
  )
</script>

<template>
  <Stack gap="none" class="-mt-(--app-header-height) pb-16">
    <VisuallyHidden as="h1">漫画</VisuallyHidden>
    <LandingUpdateStage :days="data.days" :today="data.today" :selected="data.selected_day">
      <template v-if="lead.length" #lead>
        <LandingLead :rows="lead" ratio="2/3" class="pb-4" />
      </template>
    </LandingUpdateStage>
    <Stack gap="none" class="mx-auto w-full max-w-(--entry-container) gap-12 px-4 lg:px-6">
      <LandingSection v-if="hot.length" title="本周热门">
        <LandingPodiumBook :items="hot" />
      </LandingSection>
      <LandingSection
        v-for="row in data.similar"
        :key="row.ref.id"
        :title="`与《${row.ref.title}》相似`"
      >
        <LandingSimilar :works="row.items.map(mangaWork)" ratio="2/3" />
      </LandingSection>
      <Grid
        v-if="charts.length"
        gap="xl"
        :class="charts.length > 1 ? 'lg:grid-cols-2 lg:gap-x-10' : ''"
      >
        <LandingSection v-for="chart in charts" :key="chart.title" :title="chart.title">
          <LandingChart :rows="chart.rows" ratio="2/3" :wide="charts.length === 1" />
        </LandingSection>
      </Grid>
      <LandingSection title="为你推荐">
        <LandingFeed
          :key="data.feed.cursor ?? 'end'"
          path="/api/v3/landing/mangas/feed"
          :initial="data.feed"
          :banners="data.banners"
          kind="manga"
        />
      </LandingSection>
    </Stack>
  </Stack>
</template>
