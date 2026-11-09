<script setup lang="ts">
  import { Inline } from '@hina-ui/vue'
  import type { LandingRatio, LandingWork } from '~/features/landing/works'

  defineOptions({ name: 'LandingSimilar' })
  defineProps<{ works: LandingWork[]; ratio: LandingRatio }>()
</script>

<template>
  <ScrollRail class="-mx-4 lg:-mx-6">
    <Inline gap="none" :wrap="false" align="stretch" class="min-w-max gap-4 px-4 pb-2 lg:px-6">
      <BrowseWorkCard
        v-for="work in works"
        :key="work.id"
        :to="work.to"
        :title="work.title"
        :sub="work.sub"
        :cover="work.cover"
        :ratio="ratio"
        plain-sub
        :class="ratio === '3/4' ? 'w-(--landing-tile-lg)' : 'w-(--landing-tile)'"
      />
    </Inline>
  </ScrollRail>
</template>
