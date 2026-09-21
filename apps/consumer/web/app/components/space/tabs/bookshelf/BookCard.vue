<script setup lang="ts">
  import { Button, Inline, Progress, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
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
      segments.push(vol ? `还未开始 · ${vol}` : '还未开始')
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
  <Inline gap="md" align="start" :wrap="false" class="border-b border-line py-4 last:border-b-0">
    <NuxtLink :to="`/light-novels/${item.light_novel_id}`" class="shrink-0">
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
            :to="`/light-novels/${item.light_novel_id}`"
            class="block truncate font-semibold transition-colors hover:text-accent-text"
          >
            {{ item.title }}
          </NuxtLink>
          <Text size="xs" tone="muted" truncate>{{ metaLine }}</Text>
        </Stack>
        <Button
          :as="NuxtLink"
          :to="`/light-novel-volumes/${item.current_volume_id}/read`"
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
        <Text as="span" size="xs" weight="medium" class="shrink-0">{{ pct }}%</Text>
      </Inline>
    </Stack>
  </Inline>
</template>
