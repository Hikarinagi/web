<script setup lang="ts">
  import { Star } from '@lucide/vue'
  import { workPath, workTypeLabel } from '#shared/utils/work'
  import type { WorkCardData } from './composables/useWorkCard'

  const props = defineProps<{ work: WorkCardData | null; loading: boolean }>()

  const to = computed(() => (props.work ? workPath(props.work.work_type, props.work.id) : '#'))
  const meta = computed(() =>
    props.work
      ? [workTypeLabel(props.work.work_type), props.work.byline, props.work.year]
          .filter(Boolean)
          .join(' · ')
      : '',
  )
</script>

<template>
  <div
    class="w-80 overflow-hidden rounded-xl border border-surface-200 bg-surface-0 shadow-[0_16px_48px_rgba(0,0,0,0.18)] dark:border-surface-700 dark:bg-surface-900"
  >
    <WorkCardSkeleton v-if="!work" />
    <NuxtLink
      v-else
      :to="to"
      class="block p-3 transition-colors hover:bg-surface-50 dark:hover:bg-surface-900/60"
    >
      <div class="flex gap-3">
        <HikariImage
          :src="work.cover"
          :alt="work.title"
          class="h-28 w-20 shrink-0 rounded-lg"
          image-class="size-full object-cover"
          :processing="{ q: 90 }"
        />
        <div class="flex min-w-0 flex-1 flex-col gap-1">
          <p class="line-clamp-2 text-sm font-bold text-color">{{ work.title }}</p>
          <p v-if="work.original_title" class="line-clamp-1 text-xs text-muted-color">
            {{ work.original_title }}
          </p>
          <p v-if="meta" class="line-clamp-1 text-xs text-muted-color">{{ meta }}</p>
          <div v-if="work.average_rate != null" class="mt-auto flex items-center gap-1 pt-1">
            <Star class="size-3.5 fill-amber-400 text-amber-400" />
            <span class="text-sm font-semibold text-color">{{ work.average_rate.toFixed(1) }}</span>
            <span class="text-xs text-muted-color">· {{ work.rated_count }} 人评分</span>
          </div>
          <p v-else class="mt-auto pt-1 text-xs text-muted-color">暂无评分</p>
        </div>
      </div>
      <div
        v-if="work.intro || work.aliases.length"
        class="mt-2.5 border-t border-surface-100 pt-2.5 dark:border-surface-800"
      >
        <p v-if="work.intro" class="line-clamp-3 text-xs leading-relaxed text-muted-color">
          {{ work.intro }}
        </p>
        <p v-if="work.aliases.length" class="text-muted-color/80 mt-1.5 line-clamp-1 text-[11px]">
          别名:{{ work.aliases.join(' / ') }}
        </p>
      </div>
    </NuxtLink>
  </div>
</template>
