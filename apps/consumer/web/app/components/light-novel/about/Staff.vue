<script setup lang="ts">
  import type { LightNovelPageData } from '~~/server/api/pages/light-novels/[id].get'

  defineOptions({ name: 'LightNovelAboutStaff' })
  defineProps<{ people: LightNovelPageData['people'] }>()
</script>

<template>
  <div v-if="people.length" class="flex flex-col gap-4">
    <h3 class="text-[15px] font-bold text-surface-700 dark:text-surface-200">作者和插画</h3>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <LightNovelAboutStaffCard
        v-for="item in people"
        :key="`${item.relation}-${item.person.id}`"
        :item="item"
      />
    </div>
  </div>
</template>
