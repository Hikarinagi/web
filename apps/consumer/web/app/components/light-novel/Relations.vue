<script setup lang="ts">
  import { Grid } from '@hina-ui/vue'
  import type { LightNovelPageData } from '~~/server/api/pages/light-novels/[id].get'

  defineOptions({ name: 'LightNovelRelations' })
  const props = defineProps<{ relations: LightNovelPageData['relations'] }>()

  const hasContent = computed(() => props.relations.length > 0)
</script>

<template>
  <WorkSection v-if="hasContent" title="相关作品" :meta="`${relations.length} 部`">
    <Grid :cols="3" class="gap-x-4 gap-y-5 sm:grid-cols-4 lg:grid-cols-6">
      <LightNovelRelationsCard
        v-for="r in relations"
        :key="`${r.relation}-${r.target_light_novel.id}`"
        :item="r"
      />
    </Grid>
  </WorkSection>
</template>
