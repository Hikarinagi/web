<script setup lang="ts">
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'

  defineOptions({ name: 'GalgameCrew' })
  const props = defineProps<{
    producers: GalgamePageData['producers']
    staff: GalgamePageData['staff']
  }>()

  const studios = computed(() => props.producers.filter(p => p.role !== 'LOCALIZER'))
  const localizers = computed(() => props.producers.filter(p => p.role === 'LOCALIZER'))

  const hasContent = computed(() => props.producers.length > 0 || props.staff.length > 0)
</script>

<template>
  <GalgameSection v-if="hasContent" title="工作人员">
    <div v-if="studios.length" class="flex flex-col gap-4">
      <h3 class="text-[15px] font-bold text-surface-700 dark:text-surface-200">开发商/发行商</h3>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <GalgameCrewProducerCard v-for="p in studios" :key="p.producer.id" :item="p" />
      </div>
    </div>

    <div v-if="localizers.length" class="flex flex-col gap-4">
      <h3 class="text-[15px] font-bold text-surface-700 dark:text-surface-200">本地化</h3>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <GalgameCrewProducerCard v-for="p in localizers" :key="p.producer.id" :item="p" />
      </div>
    </div>

    <div v-if="staff.length" class="flex flex-col gap-4">
      <h3 class="text-[15px] font-bold text-surface-700 dark:text-surface-200">Staff</h3>
      <GalgameCrewStaffCredits :staff="staff" />
    </div>
  </GalgameSection>
</template>
