<script setup lang="ts">
  import type { MangaPageData } from '~~/server/api/pages/mangas/[id].get'

  defineOptions({ name: 'MangaAboutStaff' })
  defineProps<{ people: MangaPageData['people'] }>()
</script>

<template>
  <div v-if="people.length" class="flex flex-col gap-4">
    <h3 class="text-[15px] font-bold text-surface-700 dark:text-surface-200">作者和作画</h3>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <MangaAboutStaffCard
        v-for="item in people"
        :key="`${item.role}-${item.person.id}`"
        :item="item"
      />
    </div>
  </div>
</template>
