<script setup lang="ts">
  import { Star } from '@lucide/vue'
  import { workPath } from '#shared/utils/work'
  import {
    RATE_DIMENSION_LABELS,
    rateDateLine,
    rateStatusLabel,
    type SpaceRateItem,
  } from '~/features/space/space'

  defineOptions({ name: 'SpaceTabsRatesRow' })

  const props = defineProps<{ item: SpaceRateItem }>()

  const statusLabel = computed(() => rateStatusLabel(props.item.work_type, props.item.status))
  const dimensions = computed(() =>
    props.item.dimensions.map(d => ({
      label: RATE_DIMENSION_LABELS[d.key] ?? d.key,
      score: d.score,
    })),
  )
</script>

<template>
  <NuxtLink
    :to="workPath(item.work_type, item.id)"
    class="group flex gap-4 border-b border-surface-100 py-4 last:border-b-0 dark:border-surface-800/60"
  >
    <WorkCardTrigger :work-type="item.work_type" :work-id="item.id">
      <HikariImage
        :src="item.cover"
        :alt="item.title"
        class="h-[84px] w-[60px] shrink-0 rounded-md bg-surface-100 dark:bg-surface-800"
        image-class="size-full object-cover"
        :processing="{ width: 120, height: 168, fit: 'cover', quality: 80 }"
      />
    </WorkCardTrigger>
    <div class="flex min-w-0 flex-1 flex-col gap-2">
      <div class="flex items-start justify-between gap-3">
        <div class="flex min-w-0 items-center gap-2">
          <p class="truncate font-semibold text-color transition-colors group-hover:text-primary">
            {{ item.title }}
          </p>
          <span
            v-if="statusLabel"
            class="shrink-0 rounded bg-surface-100 px-1.5 py-0.5 text-[11px] font-medium text-muted-color dark:bg-surface-800"
          >
            {{ statusLabel }}
          </span>
        </div>
        <div v-if="item.rate" class="flex shrink-0 items-center gap-1">
          <Star class="size-4 fill-amber-400 text-amber-400" />
          <span class="font-semibold text-color">{{ item.rate }}</span>
        </div>
      </div>

      <RateDimensionChips v-if="dimensions.length" :dimensions="dimensions" />
      <p
        v-else-if="item.rate_content"
        class="line-clamp-2 text-[13px] text-surface-600 dark:text-surface-300"
      >
        “{{ item.rate_content }}”
      </p>

      <p class="text-xs text-muted-color">{{ rateDateLine(item) }}</p>
    </div>
  </NuxtLink>
</template>
