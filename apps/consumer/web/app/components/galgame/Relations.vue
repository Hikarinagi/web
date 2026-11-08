<script setup lang="ts">
  import { Grid } from '@hina-ui/vue'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'

  defineOptions({ name: 'GalgameRelations' })
  const props = defineProps<{ relations: GalgamePageData['relations'] }>()

  const hasContent = computed(() => props.relations.length > 0)
</script>

<template>
  <WorkSection v-if="hasContent" title="相关作品" :meta="`${relations.length} 部`">
    <Grid :cols="3" gap="none" class="gap-x-4 gap-y-5 sm:grid-cols-4 lg:grid-cols-6">
      <GalgameRelationsCard
        v-for="r in relations"
        :key="`${r.relation}-${r.target_galgame.id}`"
        :item="r"
      />
    </Grid>
  </WorkSection>
</template>
