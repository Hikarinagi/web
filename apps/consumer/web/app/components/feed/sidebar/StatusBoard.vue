<script setup lang="ts">
  import { workPath as toWorkPath, workTypeLabel } from '#shared/utils/work'
  import type { SidebarRateItem } from '~/features/feed/sidebar'
  import { TimeFormatEnum, datePartFormat } from '~/utils/time-format'

  defineProps<{ items: SidebarRateItem[] }>()

  const workPath = (item: SidebarRateItem) => toWorkPath(item.work_type, item.id)

  const typeLabel = (item: SidebarRateItem) => workTypeLabel(item.work_type)

  const activity = (item: SidebarRateItem) => {
    const verb = item.work_type === 'GALGAME' ? '最近在玩' : '最近在读'
    return `${verb} · ${datePartFormat(item.last_activity_at, TimeFormatEnum.M_D_CN)}`
  }
</script>

<template>
  <ul class="pb-1.5">
    <li v-for="item in items" :key="`${item.work_type}:${item.id}`">
      <NuxtLink
        :to="workPath(item)"
        class="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-surface-50 dark:hover:bg-surface-800/50"
      >
        <HikariImage
          :src="item.cover"
          :alt="item.title"
          class="h-13 w-9 shrink-0 rounded"
          image-class="size-full object-cover"
          :processing="{ q: 90 }"
        />
        <div class="flex min-w-0 flex-1 flex-col gap-0.5">
          <p class="truncate text-[13px] font-medium text-color">{{ item.title }}</p>
          <div class="flex items-center gap-1.5">
            <span
              class="shrink-0 rounded bg-surface-50 px-1.5 py-px text-[11px] text-muted-color dark:bg-surface-800"
            >
              {{ typeLabel(item) }}
            </span>
            <span class="truncate text-[11px] text-muted-color">{{ activity(item) }}</span>
          </div>
        </div>
      </NuxtLink>
    </li>
  </ul>
</template>
