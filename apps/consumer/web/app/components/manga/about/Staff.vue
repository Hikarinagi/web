<script setup lang="ts">
  import { Grid, Heading, Stack } from '@hina-ui/vue'
  import type { MangaPageData } from '~~/server/api/pages/mangas/[id].get'

  defineOptions({ name: 'MangaAboutStaff' })
  defineProps<{ people: MangaPageData['people'] }>()
</script>

<template>
  <Stack v-if="people.length" gap="none" class="gap-4">
    <Heading :level="3" size="base" class="font-bold">作者和作画</Heading>
    <Grid :cols="1" gap="none" class="gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <MangaAboutStaffCard
        v-for="item in people"
        :key="`${item.role}-${item.person.id}`"
        :item="item"
      />
    </Grid>
  </Stack>
</template>
