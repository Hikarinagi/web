<script setup lang="ts">
  import { Grid, Heading, Stack } from '@hina-ui/vue'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'

  defineOptions({ name: 'GalgameCrew' })
  const props = defineProps<{
    producers: GalgamePageData['producers']
    staff: GalgamePageData['staff']
  }>()

  const studios = computed(() => props.producers.filter(p => p.role !== 'LOCALIZER'))
  const localizers = computed(() => props.producers.filter(p => p.role === 'LOCALIZER'))

  const hasContent = computed(() => props.producers.length > 0 || props.staff.length > 0)
</script>

<template>
  <WorkSection v-if="hasContent" title="工作人员">
    <Stack v-if="studios.length" gap="none" class="gap-4">
      <Heading :level="3" size="base" class="font-bold">开发商/发行商</Heading>
      <Grid :cols="1" gap="none" class="gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <GalgameCrewProducerCard v-for="p in studios" :key="p.producer.id" :item="p" />
      </Grid>
    </Stack>

    <Stack v-if="localizers.length" gap="none" class="gap-4">
      <Heading :level="3" size="base" class="font-bold">本地化</Heading>
      <Grid :cols="1" gap="none" class="gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <GalgameCrewProducerCard v-for="p in localizers" :key="p.producer.id" :item="p" />
      </Grid>
    </Stack>

    <Stack v-if="staff.length" gap="none" class="gap-4">
      <Heading :level="3" size="base" class="font-bold">Staff</Heading>
      <GalgameCrewStaffCredits :staff="staff" />
    </Stack>
  </WorkSection>
</template>
