<script setup lang="ts">
  import { Play, RotateCcw } from '@lucide/vue'
  import type { SpaceBookshelfItem } from '~/features/space/space'
  import { timeFromNow } from '~/utils/time-format'

  defineOptions({ name: 'SpaceTabsBookshelfBookCard' })

  const props = defineProps<{ item: SpaceBookshelfItem }>()

  const metaLine = computed(() => {
    const total = `全 ${props.item.total_volumes} 卷`
    return props.item.author ? `${props.item.author} · ${total}` : total
  })

  const statusLine = computed(() => {
    const i = props.item
    const vol = i.current_volume_number ? `第 ${i.current_volume_number} 卷` : null
    const segments: string[] = []
    if (i.is_finished) {
      segments.push(vol ? `已读完 · ${vol}` : '已读完')
    } else if (i.percentage <= 0) {
      segments.push(vol ? `还没开始 · ${vol}` : '还没开始')
    } else {
      segments.push(vol ? `读到 ${vol}` : '阅读中')
      if (i.current_chapter_title) segments.push(i.current_chapter_title)
    }
    segments.push(timeFromNow(i.last_read))
    return segments.join(' · ')
  })

  const pct = computed(() => Math.min(100, Math.max(0, Math.round(props.item.percentage))))
  const ctaLabel = computed(() =>
    props.item.is_finished ? '重读' : props.item.percentage > 0 ? '继续阅读' : '开始阅读',
  )
</script>

<template>
  <div
    class="flex gap-4 border-b border-surface-100 py-4 last:border-b-0 dark:border-surface-800/60"
  >
    <NuxtLink :to="`/light-novels/${item.light_novel_id}`" class="shrink-0">
      <HikariImage
        :src="item.cover"
        :alt="item.title"
        class="h-[84px] w-[60px] rounded-md bg-surface-100 dark:bg-surface-800"
        image-class="size-full object-cover"
        :processing="{ width: 120, height: 168, fit: 'cover', quality: 80 }"
      />
    </NuxtLink>

    <div class="flex min-w-0 flex-1 flex-col gap-1.5">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <NuxtLink
            :to="`/light-novels/${item.light_novel_id}`"
            class="block truncate font-semibold text-color transition-colors hover:text-primary"
          >
            {{ item.title }}
          </NuxtLink>
          <p class="truncate text-xs text-muted-color">{{ metaLine }}</p>
        </div>
        <Button
          :label="ctaLabel"
          size="small"
          :severity="item.is_finished ? 'secondary' : undefined"
          :outlined="item.is_finished"
          as="router-link"
          :to="`/light-novel-volumes/${item.current_volume_id}/read`"
          class="shrink-0"
        >
          <template #icon>
            <component :is="item.is_finished ? RotateCcw : Play" class="size-4" />
          </template>
        </Button>
      </div>

      <p class="truncate text-[13px] text-muted-color">{{ statusLine }}</p>
      <div class="flex items-center gap-2">
        <div
          class="h-1.5 max-w-sm flex-1 overflow-hidden rounded-full bg-surface-200 dark:bg-surface-800"
        >
          <div class="h-full rounded-full bg-primary" :style="{ width: `${pct}%` }" />
        </div>
        <span class="shrink-0 text-xs font-medium text-color">{{ pct }}%</span>
      </div>
    </div>
  </div>
</template>
