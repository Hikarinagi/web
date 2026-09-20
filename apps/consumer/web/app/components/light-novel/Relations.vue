<script setup lang="ts">
  import type { LightNovelPageData } from '~~/server/api/pages/light-novels/[id].get'

  defineOptions({ name: 'LightNovelRelations' })
  const props = defineProps<{ relations: LightNovelPageData['relations'] }>()

  const hasContent = computed(() => props.relations.length > 0)
</script>

<template>
  <LightNovelSection v-if="hasContent" title="相关作品" :meta="`${relations.length} 部`">
    <div class="grid grid-cols-3 gap-x-4 gap-y-5 sm:grid-cols-4 lg:grid-cols-6">
      <LightNovelRelationsCard
        v-for="r in relations"
        :key="`${r.relation}-${r.target_light_novel.id}`"
        :item="r"
      />
    </div>
  </LightNovelSection>
</template>
