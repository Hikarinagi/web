<script setup lang="ts">
  import { Inline, Link, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'
  import { topVotedMedia } from '~/utils/media/image'

  defineOptions({ name: 'GalgameBrandWorks' })
  const props = defineProps<{
    works: NonNullable<GalgamePageData['brand_works']>
    current: number
  }>()

  const VISIBLE = 7
  const nearby = computed(() => {
    const items = props.works.list.items
    const at = Math.max(
      items.findIndex(item => item.galgame.id === props.current),
      0,
    )
    const start = Math.min(Math.max(at - 3, 0), Math.max(items.length - VISIBLE, 0))
    return items.slice(start, start + VISIBLE).map(({ galgame }) => ({
      id: galgame.id,
      title: galgame.trans_title || galgame.origin_title,
      year: galgame.release_date?.slice(0, 4) ?? '',
      cover: topVotedMedia(galgame.covers),
    }))
  })
</script>

<template>
  <Stack v-if="nearby.length > 1" gap="sm">
    <Inline justify="between" align="baseline">
      <Text size="sm" tone="muted">同品牌作品</Text>
      <Link :as="NuxtLink" :to="`/producers/${works.id}`" class="text-sm">
        全部 {{ works.list.meta.total_items }}
      </Link>
    </Inline>
    <Stack gap="none">
      <Inline
        v-for="work in nearby"
        :key="work.id"
        gap="sm"
        align="center"
        :wrap="false"
        :class="
          cn('-mx-2 rounded-md px-2 py-1.5', work.id === current ? 'bg-subtle' : 'hover:bg-subtle')
        "
      >
        <HikariImage
          v-if="work.cover"
          :src="work.cover"
          alt=""
          :ratio="5 / 7"
          preset="thumbnail"
          class="w-7 shrink-0 rounded-sm"
        />
        <Link
          :as="NuxtLink"
          :to="`/galgames/${work.id}`"
          tone="neutral"
          :class="cn('min-w-0 flex-1 truncate text-sm', work.id === current && 'font-medium')"
        >
          {{ work.title }}
        </Link>
        <Text size="xs" tone="muted" class="tabular-nums">{{ work.year }}</Text>
      </Inline>
    </Stack>
  </Stack>
</template>
