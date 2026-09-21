<script setup lang="ts">
  import { Grid } from '@hina-ui/vue'
  import type { MangaPageData } from '~~/server/api/pages/mangas/[id].get'

  defineOptions({ name: 'MangaCharacters' })

  const props = defineProps<{ characters: MangaPageData['characters'] }>()

  const total = computed(() => props.characters.length)
</script>

<template>
  <WorkSection v-if="characters.length" title="登场角色" :meta="`共 ${total} 位`">
    <Grid :cols="1" gap="none" class="gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <MangaCharactersCard
        v-for="item in characters"
        :key="`${item.role}-${item.character.id}`"
        :item="item"
      />
    </Grid>
  </WorkSection>
</template>
