<script setup lang="ts">
  import { Grid, Heading, Stack } from '@hina-ui/vue'
  import type { LightNovelPageData } from '~~/server/api/pages/light-novels/[id].get'

  defineOptions({ name: 'LightNovelAboutCharacters' })
  defineProps<{ characters: LightNovelPageData['characters'] }>()
</script>

<template>
  <Stack v-if="characters.length" gap="none" class="gap-4">
    <Heading :level="3" size="base" class="font-bold">登场角色</Heading>
    <Grid :cols="1" gap="none" class="gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <LightNovelAboutCharacterCard
        v-for="item in characters"
        :key="`${item.role}-${item.character.id}`"
        :item="item"
      />
    </Grid>
  </Stack>
</template>
