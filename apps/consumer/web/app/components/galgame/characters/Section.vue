<script setup lang="ts">
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'

  defineOptions({ name: 'GalgameCharactersSection' })
  defineProps<{ characters: GalgamePageData['characters'] }>()
</script>

<template>
  <GalgameSection
    title="角色"
    :meta="`${characters.length} 名`"
    :empty="!characters.length"
    hide-when-empty
  >
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <GalgameCharactersCard
        v-for="item in characters"
        :key="`${item.role}-${item.character.id}`"
        :item="item"
      />
    </div>
  </GalgameSection>
</template>
