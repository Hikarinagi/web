<script setup lang="ts">
  import { Building2 } from '@lucide/vue'
  import type { ProducerPageData } from '~~/server/api/pages/producers/[id].get'
  import { producerRelationLabel } from '~/features/entity/labels'

  defineOptions({ name: 'EntityProducerRelations' })
  const props = defineProps<{ relations: ProducerPageData['relations'] }>()
  const items = computed(() => props.relations ?? [])
</script>

<template>
  <EntitySection v-if="items.length" title="关联公司" :meta="`${items.length}`">
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="r in items"
        :key="`${r.relation}-${r.target_producer.id}`"
        :to="`/producers/${r.target_producer.id}`"
        class="group flex items-center gap-3 rounded-xl border border-surface-200 bg-surface-0 p-3 transition-colors hover:border-surface-300 hover:bg-surface-50 dark:border-surface-800 dark:bg-surface-900 dark:hover:border-surface-700 dark:hover:bg-surface-800/60"
      >
        <div
          class="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-100 dark:bg-surface-800"
        >
          <HikariImage
            v-if="r.target_producer.logo"
            :src="r.target_producer.logo.src"
            :alt="r.target_producer.name"
            class="size-full"
            image-class="object-contain"
            :skeleton="false"
          >
            <template #empty><span /></template>
            <template #error><span /></template>
          </HikariImage>
          <Building2 v-else :size="20" class="text-surface-400" aria-hidden="true" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-surface-900 dark:text-surface-0">
            {{ r.target_producer.name }}
          </p>
          <span
            class="mt-1 inline-block rounded bg-surface-100 px-1.5 py-0.5 text-xs text-surface-500 dark:bg-surface-800 dark:text-surface-400"
          >
            {{ producerRelationLabel(r.relation) }}
          </span>
        </div>
      </NuxtLink>
    </div>
  </EntitySection>
</template>
