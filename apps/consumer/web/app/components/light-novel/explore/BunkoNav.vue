<script setup lang="ts">
  import { Button, Text } from '@hina-ui/vue'
  import type { LightNovelsLandingData } from '~~/server/api/pages/light-novels.get'

  defineOptions({ name: 'LightNovelExploreBunkoNav' })
  defineProps<{ bunko: LightNovelsLandingData['stats']['top_bunko'] }>()
</script>

<template>
  <LightNovelExploreSection v-if="bunko.length" title="按文库筛选">
    <LightNovelExploreRailViewport
      content-class="flex w-[var(--container-app)] flex-wrap items-center gap-2.5 px-6 pb-2"
    >
      <Button
        v-for="item in bunko"
        :key="item.id"
        as-child
        variant="outline"
        tone="neutral"
        pill
        class="w-fit"
      >
        <NuxtLink :to="`/light-novels/bunko/${item.id}`">
          {{ item.name }}
          <Text as="span" size="xs" tone="faint">{{ item.count }}</Text>
        </NuxtLink>
      </Button>
    </LightNovelExploreRailViewport>
  </LightNovelExploreSection>
</template>
