<script setup lang="ts">
  import { Grid } from '@hina-ui/vue'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'

  defineOptions({ name: 'GalgameCast' })
  defineProps<{ galgameId: number; characters: GalgamePageData['characters'] }>()
</script>

<template>
  <WorkSection v-if="characters.length" title="出场角色与声优" :meta="`${characters.length} 位`">
    <template #action>
      <WorkEditButton resource-type="galgame" :resource-id="galgameId" />
    </template>
    <Grid :cols="1" gap="none" class="gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <GalgameCastCard
        v-for="item in characters"
        :key="`${item.role}-${item.character.id}`"
        :item="item"
      />
    </Grid>
  </WorkSection>
</template>
