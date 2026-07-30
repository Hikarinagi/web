<script setup lang="ts">
  import { BookImage, Star } from '@lucide/vue'
  import type { EditorNode } from '@hikarinagi/editor-schema'
  import { useContentSummaries } from '../../composables/useContentSummaries'
  import { rateWorkHref } from './links'

  defineOptions({ name: 'HikariContentNodesEntityCardMangaRate' })

  const props = defineProps<{ node: EditorNode }>()
  const summaries = useContentSummaries()

  const id = computed(() => {
    const v = props.node.attrs?.manga_rate_id
    return typeof v === 'number' && v > 0 ? v : null
  })
  const summary = computed(() =>
    id.value !== null ? (summaries.value.manga_rates.get(id.value) ?? null) : null,
  )
  const href = computed(() =>
    summary.value ? rateWorkHref('manga_rate', summary.value.manga_id) : null,
  )
  const title = computed(() => summary.value?.manga_title ?? '未命名作品')
  const cover = computed(() => summary.value?.manga_cover ?? null)
  const hasBackdrop = computed(() => !!cover.value)
  const rate = computed(() => summary.value?.rate ?? null)
  const excerpt = computed(() => summary.value?.rate_content || null)
  const isSpoiler = computed(() => summary.value?.is_spoiler ?? false)
  const rater = computed(() => summary.value?.rater ?? null)
  const nsfw = computed(() => summary.value?.manga_nsfw ?? false)
  const { shouldBlockNsfw } = useNsfwPolicy()
  const blocked = computed(() => shouldBlockNsfw(nsfw.value))
</script>

<template>
  <HikariContentNodesEntityCardContainer
    v-if="!blocked"
    :id="id"
    type="manga_rate"
    id-attr="data-manga-rate-id"
    :href="href"
  >
    <div v-if="hasBackdrop" class="pointer-events-none absolute inset-0 z-0">
      <HikariImage
        :src="cover"
        alt=""
        :processing="{ blur: 60, brightness: 0.5, width: 600, quality: 75 }"
        :skeleton="false"
        class="size-full"
        image-class="size-full scale-110 object-cover"
      >
        <template #empty><span /></template>
        <template #error><span /></template>
      </HikariImage>
      <span
        class="absolute inset-0 bg-[linear-gradient(90deg,rgb(0_0_0/0.35)_0%,rgb(0_0_0/0.55)_40%,rgb(0_0_0/0.65)_100%)]"
        aria-hidden="true"
      />
    </div>
    <div class="relative z-1 flex items-center gap-3.5">
      <HikariImage
        :src="cover"
        :alt="title"
        preset="small"
        class="h-[100px] w-[72px] flex-none overflow-hidden rounded-md bg-(--editor-toolbar-item-hover) shadow-[0_6px_16px_rgb(0_0_0/0.35)]"
        image-class="size-full object-cover"
      >
        <template #empty><HikariContentNodesEntityCardCoverFallback :icon="BookImage" /></template>
        <template #error><HikariContentNodesEntityCardCoverFallback :icon="BookImage" /></template>
      </HikariImage>
      <div class="flex min-w-0 flex-1 flex-col gap-1">
        <div class="flex min-w-0 items-center gap-2">
          <span
            v-if="rate !== null"
            :class="[
              'inline-flex flex-none items-center gap-1 text-[15px] font-bold tabular-nums',
              hasBackdrop
                ? 'text-white [text-shadow:0_1px_6px_rgb(0_0_0/0.5)]'
                : 'text-(--editor-text-color)',
            ]"
          >
            <Star class="size-3.5 fill-amber-400 text-amber-400" />
            {{ rate }}
          </span>
          <span
            :class="[
              'min-w-0 truncate text-[17px] font-bold tracking-[-0.01em]',
              hasBackdrop
                ? 'text-white [text-shadow:0_1px_6px_rgb(0_0_0/0.5)]'
                : 'text-(--editor-text-color)',
            ]"
          >
            {{ title }}
          </span>
        </div>
        <span
          :class="[
            'flex min-w-0 items-center gap-0.5 text-[11px] tracking-[0.02em]',
            hasBackdrop
              ? 'text-white/65 [text-shadow:0_1px_3px_rgb(0_0_0/0.4)]'
              : 'text-(--editor-text-muted)',
          ]"
        >
          <UserName v-if="rater" :user="rater" :handle="false" class="min-w-0 shrink truncate" />
          <span class="shrink-0">{{ rater ? '的评分 · 漫画评分' : '漫画评分' }}</span>
        </span>
        <p
          v-if="excerpt"
          :class="[
            'line-clamp-2 text-[13px] leading-snug',
            hasBackdrop
              ? 'text-white/80 [text-shadow:0_1px_4px_rgb(0_0_0/0.45)]'
              : 'text-(--editor-text-muted)',
            isSpoiler && 'pointer-events-none blur-[5px] select-none',
          ]"
        >
          {{ excerpt }}
        </p>
      </div>
    </div>
  </HikariContentNodesEntityCardContainer>
</template>
