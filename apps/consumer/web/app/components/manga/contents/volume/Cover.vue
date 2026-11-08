<script setup lang="ts">
  import { AspectRatio, Badge, Progress, Stack, Text } from '@hina-ui/vue'
  import { Check, Lock } from '@lucide/vue'
  import { mangaChapterHeading, mangaChapterLabel } from '@hikarinagi/shared'
  import type { ContentsItem } from '~/features/manga/contents'

  defineOptions({ name: 'MangaContentsVolumeCover' })

  const props = withDefaults(
    defineProps<{
      item: ContentsItem
      read?: boolean
      current?: boolean
      currentPage?: number
      locked?: boolean
    }>(),
    { read: false, current: false, currentPage: 0, locked: false },
  )
  const emit = defineEmits<{ select: [item: ContentsItem] }>()

  const label = computed(() => mangaChapterLabel(props.item))
  const aria = computed(() =>
    [
      mangaChapterHeading(props.item),
      props.read ? '已读' : '',
      props.current ? `读到第 ${props.currentPage} 页` : '',
      props.locked ? '需要登录' : '',
    ]
      .filter(Boolean)
      .join('，'),
  )
</script>

<template>
  <Stack
    as="button"
    type="button"
    gap="xs"
    :aria-label="aria"
    class="group hn-state-layer min-w-0 hn-interactive rounded-xl p-1.5 text-start hn-press-lg"
    @click="emit('select', item)"
  >
    <Badge :content="read ? label : undefined" tone="accent" label="已读" class="block w-full">
      <AspectRatio :ratio="7 / 10" class="overflow-hidden rounded-lg ring-1 ring-line">
        <HikariImage
          :src="item.cover"
          :alt="label"
          class="size-full"
          image-class="object-cover"
          :processing="{ width: 360, quality: 88, fit: 'cover' }"
        >
          <template #empty><MangaCoverFallback :title="label" /></template>
          <template #error><MangaCoverFallback :title="label" /></template>
        </HikariImage>
        <Lock
          v-if="locked"
          class="absolute end-2 top-2 size-4 text-neutral-0 drop-shadow"
          :stroke-width="2.4"
          aria-hidden="true"
        />
      </AspectRatio>
      <template #content><Check class="size-3" :stroke-width="3" /></template>
    </Badge>
    <Progress
      v-if="current"
      :value="currentPage"
      :max="item.page_count || 1"
      size="sm"
      aria-hidden="true"
    />
    <Stack gap="none" class="min-w-0">
      <TruncatedText
        :text="label"
        size="sm"
        weight="medium"
        :class="current ? 'text-accent-text' : 'group-hover:text-accent-text'"
      />
      <Text size="xs" tone="muted" class="tabular-nums">
        {{ current ? `读到第 ${currentPage} 页` : `${item.page_count} 页` }}
      </Text>
    </Stack>
  </Stack>
</template>
