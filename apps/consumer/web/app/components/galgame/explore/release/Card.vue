<script setup lang="ts">
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
  const processing = computed(() => ({
    width: coverWidth.value * 2,
    height: RELEASE_COVER_HEIGHT * 2,
    fit: 'cover' as const,
    quality: 84,
  }))
  const release = computed(() =>
    props.showRelease ? formatReleaseBadge(props.item.start_date) : '',
  )

  function formatReleaseBadge(value: string | null | undefined) {
    if (!value) return ''

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''

    return `${date.getUTCMonth() + 1}/${date.getUTCDate()} ${WEEKDAYS[date.getUTCDay()]}`
  }
</script>

<template>
  <NuxtLink
    :to="`/galgames/${item.id}`"
    class="group flex shrink-0 flex-col gap-2"
    :style="cardStyle"
  >
    <div
      class="relative h-[258px] overflow-hidden rounded-lg border border-surface-200 bg-surface-100 transition-colors group-hover:border-surface-300 dark:border-surface-800 dark:bg-surface-800 dark:group-hover:border-surface-700"
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
      <span
        v-if="release"
        class="absolute top-2 left-2 inline-flex h-6 items-center gap-1.5 rounded-md bg-surface-900/72 px-2 text-[11px] font-semibold text-white shadow-sm backdrop-blur"
      >
        {{ release }}
      </span>
    </div>
    <div class="flex min-w-0 flex-col gap-1">
      <p
        class="truncate text-sm font-semibold text-surface-900 transition-colors group-hover:text-primary dark:text-surface-100"
      >
        {{ title }}
      </p>
      <p class="truncate text-xs font-medium text-surface-500 dark:text-surface-400">
        {{ producerText(item) }}
      </p>
    </div>
  </NuxtLink>
</template>
