<script setup lang="ts">
  import { Inline } from '@hina-ui/vue'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'

  defineOptions({ name: 'GalgameRelations' })
  defineProps<{ relations: GalgamePageData['relations'] }>()
</script>

<template>
  <template v-if="relations.length">
    <EntrySectionHead id="related" title="相关作品" :count="relations.length" />
    <Inline gap="sm">
      <GalgameRelationsCard
        v-for="item in relations"
        :key="`${item.relation}-${item.target_galgame.id}`"
        :item="item"
      />
    </Inline>
  </template>
</template>
