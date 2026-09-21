<script setup lang="ts">
  import { Button, Inline, Progress, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
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
  <Inline gap="md" align="start" :wrap="false" class="border-b border-line py-4 last:border-b-0">
    <NuxtLink :to="`/mangas/${item.manga_id}`" class="shrink-0">
      <HikariImage
        :src="item.cover"
        :alt="item.title"
        class="h-21 w-15 rounded-md bg-inset"
        image-class="size-full object-cover"
        :processing="{ width: 120, height: 168, fit: 'cover', quality: 80 }"
      />
    </NuxtLink>

    <Stack gap="xs" class="min-w-0 flex-1">
      <Inline gap="sm" align="start" justify="between" :wrap="false">
        <Stack gap="none" class="min-w-0">
          <NuxtLink
            :to="`/mangas/${item.manga_id}`"
            class="block truncate font-semibold transition-colors hover:text-accent-text"
          >
            {{ item.title }}
          </NuxtLink>
          <Text size="xs" tone="muted" truncate>{{ metaLine }}</Text>
        </Stack>
        <Button
          :as="NuxtLink"
          :to="readTarget"
          size="sm"
          :variant="item.is_finished ? 'outline' : 'solid'"
          :tone="item.is_finished ? 'neutral' : 'accent'"
          class="shrink-0"
        >
          <template #icon>
            <component :is="item.is_finished ? RotateCcw : Play" />
          </template>
          {{ ctaLabel }}
        </Button>
      </Inline>

      <Text size="sm" tone="muted" truncate>{{ statusLine }}</Text>
      <Inline gap="sm" :wrap="false">
        <Progress :value="pct" size="sm" aria-label="阅读进度" class="max-w-sm flex-1" />
        <Text as="span" size="xs" weight="medium" class="shrink-0">
          {{ item.current_chapter_index }} / {{ item.total_chapters }} 话
        </Text>
      </Inline>
    </Stack>
  </Inline>
</template>
