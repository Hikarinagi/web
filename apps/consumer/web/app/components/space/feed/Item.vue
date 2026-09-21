<script setup lang="ts">
  import type { Component } from 'vue'
  import { Inline, Rating, Stack, Text } from '@hina-ui/vue'
  import { Eye, Heart, MessageSquare } from '@lucide/vue'
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
    if ('like_count' in item) rows.push({ key: 'likes', icon: Heart, value: item.like_count })
    if ('comment_count' in item) {
      rows.push({ key: 'comments', icon: MessageSquare, value: item.comment_count })
    }
    return rows
  })
</script>

<template>
  <Stack as="article" gap="sm" class="group relative border-b border-line py-4 last:border-b-0">
    <NuxtLink :to="to" class="absolute inset-0" :aria-label="verb" />

    <Text size="sm" tone="muted">{{ verb }} · {{ timeFromNow(item.sort_time) }}</Text>

    <Inline v-if="work" gap="sm" class="rounded-lg bg-subtle p-2.5" :wrap="false">
      <HikariImage
        :src="work.cover"
        :alt="work.title"
        class="h-15 w-11 shrink-0 rounded bg-inset"
        image-class="size-full object-cover"
        :processing="{ width: 120, height: 164, fit: 'cover', quality: 78 }"
      />
      <Stack gap="xs" class="min-w-0 flex-1">
        <Text weight="medium" truncate class="transition-colors group-hover:text-accent-text">
          {{ work.title }}
        </Text>
        <Inline v-if="work.rate || work.note" gap="xs" class="min-w-0">
          <template v-if="work.rate">
            <Rating :model-value="work.rate" :max="10" :stars="5" readonly size="sm" />
            <Text as="span" size="sm" weight="semibold" class="shrink-0">{{ work.rate }}</Text>
          </template>
          <Text v-if="work.note" as="span" size="sm" tone="muted" truncate>· {{ work.note }}</Text>
        </Inline>
      </Stack>
    </Inline>

    <FeedItemPost v-else-if="item.type === 'post'" :item="item" />

    <Inline v-else-if="item.type === 'article'" gap="md" align="start" :wrap="false">
      <Stack gap="xs" class="min-w-0 flex-1">
        <Text
          weight="semibold"
          class="line-clamp-2 leading-snug transition-colors group-hover:text-accent-text"
        >
          {{ item.title }}
        </Text>
        <Text v-if="item.excerpt" size="sm" tone="muted" class="line-clamp-2 leading-relaxed">
          {{ item.excerpt }}
        </Text>
      </Stack>
      <HikariImage
        v-if="item.cover"
        :src="item.cover.src"
        :alt="item.title"
        class="h-24 w-36 shrink-0 rounded-lg bg-inset"
        image-class="size-full object-cover"
        :processing="{ width: 288, height: 192, fit: 'cover', quality: 80 }"
      />
    </Inline>

    <Inline v-if="stats.length" gap="md" class="relative z-1">
      <Inline v-for="stat in stats" :key="stat.key" as="span" gap="xs">
        <component :is="stat.icon" class="size-3.5 text-muted" />
        <Text as="span" size="xs" tone="muted">{{ stat.value }}</Text>
      </Inline>
    </Inline>
  </Stack>
</template>
