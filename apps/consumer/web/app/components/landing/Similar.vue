<script setup lang="ts">
  import { Grid } from '@hina-ui/vue'
  import type { LandingRatio, LandingWork } from '~/features/landing/works'

  defineOptions({ name: 'LandingSimilar' })
  defineProps<{ works: LandingWork[]; ratio: LandingRatio }>()
</script>

<template>
  <ScrollRail class="-mx-4 -my-2 lg:-mx-2">
    <Grid
      gap="none"
      :class="
        cn(
          'w-max grid-flow-col grid-cols-none gap-4 px-4 py-2 lg:w-full lg:auto-cols-auto lg:grid-flow-row lg:grid-cols-6 lg:gap-x-6 lg:gap-y-8 lg:px-2',
          ratio === '3/4' ? 'auto-cols-(--landing-tile-lg)' : 'auto-cols-(--landing-tile)',
        )
      "
    >
      <BrowseWorkCard
        v-for="work in works"
        :key="work.id"
        :to="work.to"
        :title="work.title"
        :sub="work.sub"
        :cover="work.cover"
        :ratio="ratio"
        plain-sub
      />
    </Grid>
  </ScrollRail>
</template>
