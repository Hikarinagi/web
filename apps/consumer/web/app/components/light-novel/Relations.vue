<script setup lang="ts">
  import { Inline } from '@hina-ui/vue'
  import type { LightNovelPageData } from '~~/server/api/pages/light-novels/[id].get'

  defineOptions({ name: 'LightNovelRelations' })
  defineProps<{ relations: LightNovelPageData['relations'] }>()
</script>

<template>
  <template v-if="relations.length">
    <EntrySectionHead id="related" title="相关作品" :count="relations.length" />
    <Inline gap="sm">
      <LightNovelRelationsCard
        v-for="item in relations"
        :key="`${item.relation}-${item.target_light_novel.id}`"
        :item="item"
      />
    </Inline>
  </template>
</template>
