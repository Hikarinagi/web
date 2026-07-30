<script setup lang="ts">
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'

  defineOptions({ name: 'GalgameAboutCharacters' })
  defineProps<{ characters: GalgamePageData['characters'] }>()
</script>

<template>
  <div v-if="characters.length" class="flex flex-col gap-4">
    <h3 class="text-[15px] font-bold text-surface-700 dark:text-surface-200">出场角色与声优</h3>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <GalgameAboutCharacterCard
        v-for="item in characters"
        :key="`${item.role}-${item.character.id}`"
        :item="item"
      />
    </div>
  </div>
</template>
