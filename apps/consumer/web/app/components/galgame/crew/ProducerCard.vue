<script setup lang="ts">
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'
  import { producerRoleLabel } from '~/features/galgame/labels'

  defineOptions({ name: 'GalgameCrewProducerCard' })
  const props = defineProps<{ item: GalgamePageData['producers'][number] }>()

  const roleText = computed(() => producerRoleLabel(props.item.role) || '厂商')
</script>

<template>
  <NuxtLink
    :to="`/producers/${item.producer.id}`"
    class="group flex flex-col gap-1 rounded-xl border border-surface-200 bg-surface-0 px-5 py-4 transition-colors hover:border-surface-300 dark:border-surface-800 dark:bg-surface-900 dark:hover:border-surface-700"
  >
    <p
      class="text-[15px] font-bold wrap-anywhere text-surface-900 transition-colors group-hover:text-hikari-primary-600 dark:text-surface-0 dark:group-hover:text-hikari-primary-400"
    >
      {{ item.producer.name }}
      <span v-if="item.note" class="text-sm font-normal text-surface-400">({{ item.note }})</span>
    </p>
    <p class="text-xs text-surface-500 dark:text-surface-400">{{ roleText }}</p>
  </NuxtLink>
</template>
