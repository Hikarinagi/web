<script setup lang="ts">
  import { Grid } from '@hina-ui/vue'
  import type { LandingContinueItem } from '~/components/landing/Continue.vue'
  import type { LandingRatio } from '~/features/landing/works'

  defineOptions({ name: 'LandingLead' })
  defineProps<{ rows: { title: string; items: LandingContinueItem[] }[]; ratio: LandingRatio }>()
</script>

<template>
  <Grid gap="xl" :class="rows.length > 1 ? 'lg:grid-cols-2 lg:gap-x-10' : ''">
    <LandingSection v-for="row in rows" :key="row.title" :title="row.title">
      <LandingContinue :items="row.items" :ratio="ratio" />
    </LandingSection>
  </Grid>
</template>
