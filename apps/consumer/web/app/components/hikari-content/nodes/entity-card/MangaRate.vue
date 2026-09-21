<script setup lang="ts">
  import { Inline, Rating, Stack, Text } from '@hina-ui/vue'
  import { BookImage } from '@lucide/vue'
  import type { EditorNode } from '@hikarinagi/editor-schema'
  import { useContentSummaries } from '../../composables/useContentSummaries'
  import { rateWorkHref } from './links'
  import { rateCardTone } from './tone'

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
  const tone = computed(() => rateCardTone(hasBackdrop.value))
</script>

<template>
  <HikariContentNodesEntityCardContainer
    v-if="!blocked"
    :id="id"
    type="manga_rate"
    id-attr="data-manga-rate-id"
    :href="href"
  >
    <HikariContentNodesEntityCardBackdrop v-if="hasBackdrop" :src="cover ?? undefined" />
    <Inline gap="none" align="center" :wrap="false" class="relative z-1 gap-3.5">
      <HikariImage
        :src="cover"
        :alt="title"
        preset="small"
        class="h-25 w-18 flex-none overflow-hidden rounded-md bg-(--editor-toolbar-item-hover) shadow-hikari-cover-xs"
        image-class="size-full object-cover"
      >
        <template #empty><HikariContentNodesEntityCardCoverFallback :icon="BookImage" /></template>
        <template #error><HikariContentNodesEntityCardCoverFallback :icon="BookImage" /></template>
      </HikariImage>
      <Stack gap="none" class="min-w-0 flex-1 gap-1">
        <Inline gap="none" align="center" :wrap="false" class="min-w-0 gap-2">
          <Inline
            v-if="rate !== null"
            gap="none"
            align="center"
            :wrap="false"
            :class="cn('flex-none gap-1 text-base font-bold tabular-nums', tone.title)"
          >
            <Rating :model-value="rate" :max="10" :stars="1" readonly size="sm" />
            {{ rate }}
          </Inline>
          <Text as="span" size="md" truncate :class="cn('min-w-0 font-bold', tone.title)">
            {{ title }}
          </Text>
        </Inline>
        <Inline
          gap="none"
          align="center"
          :wrap="false"
          :class="cn('min-w-0 gap-0.5 text-xs tracking-wide', tone.byline)"
        >
          <UserName v-if="rater" :user="rater" :handle="false" class="min-w-0 shrink truncate" />
          <Text as="span" size="xs" class="shrink-0">
            {{ rater ? '的评分 · 漫画评分' : '漫画评分' }}
          </Text>
        </Inline>
        <Text
          v-if="excerpt"
          as="p"
          size="sm"
          :class="
            cn(
              'line-clamp-2 leading-snug',
              tone.excerpt,
              isSpoiler && 'pointer-events-none blur-xs select-none',
            )
          "
        >
          {{ excerpt }}
        </Text>
      </Stack>
    </Inline>
  </HikariContentNodesEntityCardContainer>
</template>
