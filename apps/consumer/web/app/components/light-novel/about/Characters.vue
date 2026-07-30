<script setup lang="ts">
  import type { LightNovelPageData } from '~~/server/api/pages/light-novels/[id].get'

  defineOptions({ name: 'LightNovelAboutCharacters' })
  defineProps<{ characters: LightNovelPageData['characters'] }>()
</script>

<template>
  <div v-if="characters.length" class="flex flex-col gap-4">
    <h3 class="text-[15px] font-bold text-surface-700 dark:text-surface-200">登场角色</h3>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <LightNovelAboutCharacterCard
        v-for="item in characters"
        :key="`${item.role}-${item.character.id}`"
        :item="item"
      />
    </div>
  </div>
</template>
