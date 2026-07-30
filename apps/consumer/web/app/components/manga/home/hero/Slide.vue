<script setup lang="ts">
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
  <div class="flex flex-col items-start gap-2">
    <div class="flex flex-wrap items-center gap-1.5">
      <Tag
        v-for="(tag, index) in tags"
        :key="tag"
        :value="tag"
        :severity="index === 0 ? undefined : 'secondary'"
        class="px-2! py-0.5! text-xs! font-medium!"
      />
    </div>
    <h2 class="line-clamp-1 text-3xl leading-9.5 font-bold text-surface-950 dark:text-white">
      {{ title }}
    </h2>
    <p class="h-5 max-w-full truncate text-sm text-muted-color">
      {{ originalTitle }}
    </p>
    <p class="line-clamp-1 h-5 text-sm text-muted-color">{{ factText }}</p>
    <p
      class="line-clamp-2 h-11 max-w-120 text-sm leading-5.5 text-surface-600 dark:text-surface-300"
    >
      {{ slide.intro ?? '' }}
    </p>
    <Button as="router-link" :to="`/mangas/${slide.manga.id}`" label="看看这部" />
  </div>
</template>
