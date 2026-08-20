<script setup lang="ts">
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'

  defineOptions({ name: 'GalgameDerivativesRelationsGroup' })
  defineProps<{ relations: GalgamePageData['relations'] }>()
</script>

<template>
  <div v-if="relations.length" class="flex flex-col gap-4">
    <div class="flex items-center gap-2">
      <h3 class="text-[15px] font-bold text-surface-700 dark:text-surface-200">相关作品</h3>
      <p class="text-[13px] text-surface-500 dark:text-surface-400">{{ relations.length }} 部</p>
    </div>
    <div class="grid grid-cols-3 gap-x-4 gap-y-5 sm:grid-cols-4 lg:grid-cols-6">
      <GalgameDerivativesRelationsCard
        v-for="r in relations"
        :key="`${r.relation}-${r.target_galgame.id}`"
        :item="r"
      />
    </div>
  </div>
</template>
