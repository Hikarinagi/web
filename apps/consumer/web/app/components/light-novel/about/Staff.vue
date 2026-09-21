<script setup lang="ts">
  import { Grid, Heading, Stack } from '@hina-ui/vue'
  import type { LightNovelPageData } from '~~/server/api/pages/light-novels/[id].get'

  defineOptions({ name: 'LightNovelAboutStaff' })
  defineProps<{ people: LightNovelPageData['people'] }>()
</script>

<template>
  <Stack v-if="people.length" gap="none" class="gap-4">
    <Heading :level="3" size="base" class="font-bold">作者和插画</Heading>
    <Grid :cols="1" gap="none" class="gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <LightNovelAboutStaffCard
        v-for="item in people"
        :key="`${item.relation}-${item.person.id}`"
        :item="item"
      />
    </Grid>
  </Stack>
</template>
