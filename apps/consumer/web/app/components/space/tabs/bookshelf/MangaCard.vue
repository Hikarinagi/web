<script setup lang="ts">
  import { Play, RotateCcw } from '@lucide/vue'
  import type { SpaceMangaShelfItem } from '~/features/space/space'
  import { timeFromNow } from '~/utils/time-format'

  defineOptions({ name: 'SpaceTabsBookshelfMangaCard' })

  const props = defineProps<{ item: SpaceMangaShelfItem }>()

  const metaLine = computed(() => {
    const i = props.item
    const serial =
      i.serial_status === 'FINISHED'
        ? `已完结，全 ${i.total_chapters} 话`
        : `连载中，更新至第 ${i.total_chapters} 话`
    return i.author ? `${i.author} · ${serial}` : serial
  })

  const chapterLabel = computed(() => {
    const i = props.item
    if (i.current_chapter_number) return `第 ${i.current_chapter_number} 话`
    return i.current_chapter_title ?? `第 ${i.current_chapter_index} 话`
  })

  const statusLine = computed(() => {
    const i = props.item
    const segments: string[] = []
    if (i.is_finished) {
      segments.push('已读完')
    } else {
      segments.push(`读到${chapterLabel.value}`)
      if (i.is_latest) segments.push('已是最新')
    }
    segments.push(timeFromNow(i.last_read))
    return segments.join(' · ')
  })

  const pct = computed(() => {
    const i = props.item
    if (i.total_chapters <= 0) return 0
    return Math.min(
      100,
      Math.max(0, Math.round((i.current_chapter_index / i.total_chapters) * 100)),
    )
  })

  const readTarget = computed(() => {
    const i = props.item
    const chapterId =
      i.is_finished && i.first_chapter_id ? i.first_chapter_id : i.current_chapter_id
    return `/mangas/${i.manga_id}/read/${chapterId}`
  })
  const ctaLabel = computed(() => (props.item.is_finished ? '重读' : '继续阅读'))
</script>

<template>
  <div
    class="flex gap-4 border-b border-surface-100 py-4 last:border-b-0 dark:border-surface-800/60"
  >
    <NuxtLink :to="`/mangas/${item.manga_id}`" class="shrink-0">
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
            :to="`/mangas/${item.manga_id}`"
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
          :to="readTarget"
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
        <span class="shrink-0 text-xs font-medium text-color">
          {{ item.current_chapter_index }} / {{ item.total_chapters }} 话
        </span>
      </div>
    </div>
  </div>
</template>
