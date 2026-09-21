<script setup lang="ts">
  import { Heading, Inline, Stack, Text } from '@hina-ui/vue'
  import type { LightNovelsLandingData } from '~~/server/api/pages/light-novels.get'

  defineOptions({ name: 'LightNovelExploreBunkoPicks' })
  defineProps<{ picks: LightNovelsLandingData['bunko_picks'] }>()
</script>

<template>
  <LightNovelExploreSection v-if="picks.length" title="文库精选" gap="loose">
    <Stack v-for="pick in picks" :key="pick.bunko.id" gap="none" class="gap-3">
      <Inline align="baseline" :wrap="false">
        <Heading :level="3" size="base">{{ pick.bunko.name }}</Heading>
        <Text size="xs" tone="faint">{{ pick.bunko.count }} 部</Text>
        <ViewAllLink :to="`/light-novels/bunko/${pick.bunko.id}`" class="ms-auto">
          查看全部
        </ViewAllLink>
      </Inline>
      <LightNovelExploreRailViewport>
        <LightNovelExploreSeriesCard
          v-for="row in pick.works.items"
          :key="row.light_novel.id"
          :item="row.light_novel"
          class="w-34"
        />
      </LightNovelExploreRailViewport>
    </Stack>
  </LightNovelExploreSection>
</template>
