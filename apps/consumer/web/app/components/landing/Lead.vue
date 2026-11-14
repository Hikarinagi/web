<script setup lang="ts">
  import { Grid } from '@hina-ui/vue'
  import type { LandingContinueItem } from '~/components/landing/Continue.vue'
  import type { LandingRatio } from '~/features/landing/works'

  defineOptions({ name: 'LandingLead' })
  const props = defineProps<{
    rows: { title: string; items: LandingContinueItem[] }[]
    ratio: LandingRatio
  }>()

  const paired = computed(() => props.rows.length > 1)
  const size = computed(() => (paired.value ? 4 : 8))
</script>

<template>
  <Grid gap="xl" :class="paired ? 'lg:grid-cols-2 lg:gap-x-10' : ''">
    <LandingSection v-for="row in rows" :key="row.title" :title="row.title">
      <LandingContinue :items="row.items.slice(0, size)" :ratio="ratio" :paired="paired" />
    </LandingSection>
  </Grid>
</template>
