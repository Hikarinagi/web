<script setup lang="ts">
  import type { Component } from 'vue'
  import { Eye, MessageSquare, Star, ThumbsUp } from '@lucide/vue'
  import { timeFromNow } from '#imports'
  import { workPath, workTypeLabel } from '#shared/utils/work'
  import { statusVerb, type BackendFeedItem } from '~/features/feed/feed'

  defineOptions({ name: 'SpaceFeedItem' })

  const props = defineProps<{ item: BackendFeedItem }>()

  const to = computed(() => {
    const item = props.item
    switch (item.type) {
      case 'post':
        return `/posts/${item.id}`
      case 'article':
        return `/articles/${item.id}`
      case 'light_novel_volume_rate':
        return `/light-novel-volumes/${item.volume_ref.id}`
      default:
        return workPath(item.work_ref.work_type, item.work_ref.id)
    }
  })

  const verb = computed(() => {
    const item = props.item
    switch (item.type) {
      case 'post':
        return '发布动态'
      case 'article':
        return item.is_review ? '写了长评' : '发布文章'
      case 'galgame_status':
      case 'light_novel_status':
      case 'manga_status':
        return `${statusVerb(item.type, item.status ?? '')} ${workTypeLabel(item.work_ref.work_type)}`
      case 'galgame_rate':
      case 'light_novel_rate':
      case 'manga_rate':
        return `评分 ${workTypeLabel(item.work_ref.work_type)}`
      case 'light_novel_volume_rate':
        return '卷评'
    }
    return ''
  })

  // 作品类(评分 / 打卡 / 卷评)统一渲染成作品迷你卡。
  const work = computed(() => {
    const item = props.item
    if (item.type === 'light_novel_volume_rate') {
      return {
        cover: item.volume_ref.cover,
        title:
          item.volume_ref.name_cn ||
          item.volume_ref.name ||
          `第 ${item.volume_ref.volume_number} 卷`,
        rate: item.rate,
        note: item.rate_content || null,
      }
    }
    if (
      item.type === 'galgame_rate' ||
      item.type === 'light_novel_rate' ||
      item.type === 'manga_rate'
    ) {
      return {
        cover: item.work_ref.cover,
        title: item.work_ref.title,
        rate: item.rate,
        note: item.rate_content || null,
      }
    }
    if (
      item.type === 'galgame_status' ||
      item.type === 'light_novel_status' ||
      item.type === 'manga_status'
    ) {
      return { cover: item.work_ref.cover, title: item.work_ref.title, rate: null, note: null }
    }
    return null
  })

  const stats = computed(() => {
    const item = props.item
    if (item.type !== 'post' && item.type !== 'article') return []

    const rows: { key: string; icon: Component; value: number }[] = []
    if ('view_count' in item) rows.push({ key: 'views', icon: Eye, value: item.view_count })
    if ('like_count' in item) rows.push({ key: 'likes', icon: ThumbsUp, value: item.like_count })
    if ('comment_count' in item) {
      rows.push({ key: 'comments', icon: MessageSquare, value: item.comment_count })
    }
    return rows
  })
</script>

<template>
  <article
    class="group relative flex flex-col gap-2.5 border-b border-surface-100 py-4 last:border-b-0 dark:border-surface-800/60"
  >
    <NuxtLink :to="to" class="absolute inset-0" :aria-label="verb" />

    <p class="text-[13px] text-muted-color">{{ verb }} · {{ timeFromNow(item.sort_time) }}</p>

    <div
      v-if="work"
      class="flex items-center gap-3 rounded-lg bg-surface-50 p-2.5 dark:bg-surface-800/40"
    >
      <HikariImage
        :src="work.cover"
        :alt="work.title"
        class="h-15 w-11 shrink-0 rounded bg-surface-100 dark:bg-surface-700"
        image-class="size-full object-cover"
        :processing="{ width: 120, height: 164, fit: 'cover', quality: 78 }"
      />
      <div class="flex min-w-0 flex-1 flex-col gap-1">
        <p class="truncate font-medium text-color transition-colors group-hover:text-primary">
          {{ work.title }}
        </p>
        <div v-if="work.rate || work.note" class="flex min-w-0 items-center gap-1.5 text-[13px]">
          <template v-if="work.rate">
            <Star class="size-3.5 shrink-0 fill-amber-400 text-amber-400" />
            <span class="shrink-0 font-semibold text-color">{{ work.rate }}</span>
          </template>
          <span v-if="work.note" class="truncate text-muted-color">· {{ work.note }}</span>
        </div>
      </div>
    </div>

    <FeedItemPost v-else-if="item.type === 'post'" :item="item" />

    <div v-else-if="item.type === 'article'" class="flex gap-4">
      <div class="flex min-w-0 flex-1 flex-col gap-1.5">
        <p
          class="line-clamp-2 text-base leading-snug font-semibold text-color transition-colors group-hover:text-primary"
        >
          {{ item.title }}
        </p>
        <p v-if="item.excerpt" class="line-clamp-2 text-sm leading-relaxed text-muted-color">
          {{ item.excerpt }}
        </p>
      </div>
      <HikariImage
        v-if="item.cover"
        :src="item.cover.src"
        :alt="item.title"
        class="h-24 w-36 shrink-0 rounded-lg bg-surface-100 dark:bg-surface-800"
        image-class="size-full object-cover"
        :processing="{ width: 288, height: 192, fit: 'cover', quality: 80 }"
      />
    </div>

    <div
      v-if="stats.length"
      class="relative z-1 flex items-center gap-3.5 text-xs text-muted-color"
    >
      <span v-for="stat in stats" :key="stat.key" class="flex items-center gap-1">
        <component :is="stat.icon" class="size-3.5" />
        {{ stat.value }}
      </span>
    </div>
  </article>
</template>
