<script setup lang="ts">
  import { Link, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { GalgamesPageData } from '~~/server/api/pages/galgames.get'
  import { producerText, titleOf } from '~/features/galgame/explore'
  import { topVotedMedia } from '~/utils/media/image'

  defineOptions({ name: 'GalgameExploreReleaseCard' })
  const props = withDefaults(
    defineProps<{
      item: GalgamesPageData['release']['items'][number]
      showRelease?: boolean
    }>(),
    { showRelease: true },
  )
  const RELEASE_COVER_HEIGHT = 258
  const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'] as const

  const title = computed(() => titleOf(props.item))
  const cover = computed(() => topVotedMedia(props.item.covers))
  const coverWidth = computed(() => {
    const media = cover.value
    const ratio = media?.width && media.height ? media.width / media.height : 3 / 4

    return Math.round(ratio * RELEASE_COVER_HEIGHT)
  })
  const cardStyle = computed(() => ({ width: `${coverWidth.value}px` }))
  const coverStyle = { height: `${RELEASE_COVER_HEIGHT}px` }
  const processing = computed(() => ({
    width: coverWidth.value * 2,
    height: RELEASE_COVER_HEIGHT * 2,
    fit: 'cover' as const,
    quality: 84,
  }))
  const release = computed(() =>
    props.showRelease ? formatReleaseBadge(props.item.release_date) : '',
  )

  function formatReleaseBadge(value: string | null | undefined) {
    if (!value) return ''

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''

    return `${date.getUTCMonth() + 1}/${date.getUTCDate()} ${WEEKDAYS[date.getUTCDay()]}`
  }
</script>

<template>
  <Link
    :as="NuxtLink"
    :to="`/galgames/${item.id}`"
    tone="neutral"
    :underline="false"
    class="group flex shrink-0 flex-col gap-2"
    :style="cardStyle"
  >
    <Stack
      gap="none"
      class="relative overflow-hidden rounded-lg border border-line bg-subtle transition-colors group-hover:border-line-strong"
      :style="coverStyle"
    >
      <HikariImage
        :src="cover"
        :alt="title"
        class="size-full"
        image-class="size-full object-cover object-top"
        :processing="processing"
        :lazy="true"
        :skeleton="false"
      />
      <Text
        v-if="release"
        as="span"
        size="xs"
        weight="semibold"
        class="absolute top-2 left-2 inline-flex h-6 items-center gap-1.5 rounded-md bg-black/70 px-2 text-white shadow-sm backdrop-blur"
      >
        {{ release }}
      </Text>
    </Stack>

    <Stack gap="none" class="min-w-0 gap-1">
      <Text
        as="p"
        size="sm"
        weight="semibold"
        truncate
        class="transition-colors group-hover:text-accent-text"
      >
        {{ title }}
      </Text>
      <Text as="p" size="xs" weight="medium" tone="muted" truncate>
        {{ producerText(item) }}
      </Text>
    </Stack>
  </Link>
</template>
