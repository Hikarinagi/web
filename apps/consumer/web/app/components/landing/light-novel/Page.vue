<script setup lang="ts">
  import { Stack, VisuallyHidden } from '@hina-ui/vue'
  import type { LightNovelsPageData } from '~~/server/api/pages/light-novels.get'
  import { dayLabel, volumeLabel } from '~/features/landing/labels'
  import { novelWork } from '~/features/landing/works'

  defineOptions({ name: 'LandingLightNovelPage' })
  const props = defineProps<{ data: LightNovelsPageData }>()

  const lead = computed(() =>
    [
      {
        title: '在读系列的新卷',
        items: props.data.fresh.map(item => ({
          work: novelWork(item),
          to: `/light-novel-volumes/${item.volume.id}`,
          note: [
            volumeLabel(item.volume),
            item.volume.release_date ? `${dayLabel(item.volume.release_date)}发售` : '',
          ]
            .filter(Boolean)
            .join('，'),
        })),
      },
      {
        title: '继续阅读',
        items: props.data.reading.map(item => ({
          work: {
            id: item.light_novel_id,
            to: `/light-novels/${item.light_novel_id}`,
            title: item.title,
            sub: item.author ?? '',
            cover: item.current_volume_cover ?? item.cover,
          },
          to: `/light-novel-volumes/${item.current_volume_id}/read`,
          note:
            item.current_volume_number && item.total_volumes
              ? `读到第 ${item.current_volume_number} 卷，共 ${item.total_volumes} 卷`
              : (item.current_volume_title ?? ''),
          progress:
            item.current_volume_number && item.total_volumes
              ? Math.min(1, item.current_volume_number / item.total_volumes)
              : undefined,
        })),
      },
    ].filter(row => row.items.length),
  )
  const hot = computed(() =>
    props.data.hot.map(item => ({ work: novelWork(item), detail: `共 ${item.volume_count} 卷` })),
  )
  const finished = computed(() =>
    props.data.finished.map(item => ({
      work: novelWork(item),
      note: `共 ${item.volume_count} 卷`,
    })),
  )
</script>

<template>
  <Stack gap="none" class="-mt-(--app-header-height) pb-16">
    <VisuallyHidden as="h1">轻小说</VisuallyHidden>
    <LandingVolumeStage v-if="data.volumes.length" :volumes="data.volumes" :today="data.today">
      <template v-if="lead.length" #lead>
        <LandingLead :rows="lead" ratio="2/3" class="pb-4" />
      </template>
    </LandingVolumeStage>
    <Stack
      gap="none"
      :class="
        cn(
          'mx-auto w-full max-w-(--entry-container) gap-12 px-4 lg:px-6',
          !data.volumes.length && 'pt-(--landing-stage-top)',
        )
      "
    >
      <LandingLead v-if="!data.volumes.length && lead.length" :rows="lead" ratio="2/3" />
      <LandingSection v-if="hot.length" title="本周热门">
        <LandingPodiumBook :items="hot" />
      </LandingSection>
      <LandingSection
        v-for="row in data.similar"
        :key="row.ref.id"
        :title="`与《${row.ref.title}》相似`"
      >
        <LandingSimilar :works="row.items.map(novelWork)" ratio="2/3" />
      </LandingSection>
      <LandingSection v-if="finished.length" title="已完结且全卷可读">
        <LandingChart :rows="finished" ratio="2/3" wide />
      </LandingSection>
      <LandingSection title="为你推荐">
        <LandingFeed
          :key="data.feed.cursor ?? 'end'"
          path="/api/v3/landing/light-novels/feed"
          :initial="data.feed"
          :banners="data.banners"
          kind="light_novel"
        />
      </LandingSection>
    </Stack>
  </Stack>
</template>
