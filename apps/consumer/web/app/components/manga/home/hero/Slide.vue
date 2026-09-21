<script setup lang="ts">
  import { Button, Heading, Inline, Stack, Tag, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { MangaHomePageData } from '~~/server/api/pages/mangas.get'
  import { statusText, titleOf } from '~/features/manga/explore'

  defineOptions({ name: 'MangaHomeHeroSlide' })
  const props = defineProps<{ slide: MangaHomePageData['hero']['slides'][number] }>()

  const title = computed(() => props.slide.title || titleOf(props.slide.manga))
  const originalTitle = computed(() =>
    props.slide.manga.name_cn && props.slide.manga.name_cn !== props.slide.manga.name
      ? props.slide.manga.name
      : '',
  )
  const tags = computed(() => {
    if (props.slide.kicker) return [props.slide.kicker]
    if (props.slide.source === 'featured') return ['编辑推荐']
    if (props.slide.source === 'spotlight') return ['今日安利', '完结经典']
    return ['热门连载', `TOP ${props.slide.rank}`]
  })
  const factText = computed(() => {
    const manga = props.slide.manga
    const year = manga.publication_date
      ? new Date(manga.publication_date).getUTCFullYear()
      : Number.NaN

    return [
      Number.isFinite(year) ? `${year} 年开始连载` : '',
      statusText(manga.serial_status),
      props.slide.magazine ?? '',
    ]
      .filter(Boolean)
      .join(' · ')
  })
</script>

<template>
  <Stack align="start" gap="sm">
    <Inline gap="none" class="gap-1.5">
      <Tag
        v-for="(tag, index) in tags"
        :key="tag"
        :tone="index === 0 ? 'accent' : 'neutral'"
        weight="medium"
      >
        {{ tag }}
      </Tag>
    </Inline>
    <Heading :level="2" size="2xl" class="line-clamp-1 text-3xl leading-9.5">
      {{ title }}
    </Heading>
    <Text size="sm" tone="muted" truncate class="h-5 max-w-full">
      {{ originalTitle }}
    </Text>
    <Text size="sm" tone="muted" class="line-clamp-1 h-5">{{ factText }}</Text>
    <Text size="sm" tone="muted" class="line-clamp-2 h-11 max-w-120 leading-5.5">
      {{ slide.intro ?? '' }}
    </Text>
    <Button :as="NuxtLink" :to="`/mangas/${slide.manga.id}`">查看详情</Button>
  </Stack>
</template>
