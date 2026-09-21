<script setup lang="ts">
  import { Grid, Heading, Stack } from '@hina-ui/vue'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'

  defineOptions({ name: 'GalgameAboutCharacters' })
  defineProps<{ characters: GalgamePageData['characters'] }>()
</script>

<template>
  <Stack v-if="characters.length" gap="none" class="gap-4">
    <Heading :level="3" size="base" class="font-bold">出场角色与声优</Heading>
    <Grid :cols="1" gap="none" class="gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <GalgameAboutCharacterCard
        v-for="item in characters"
        :key="`${item.role}-${item.character.id}`"
        :item="item"
      />
    </Grid>
  </Stack>
</template>
