<script setup lang="ts">
  import { Inline } from '@hina-ui/vue'
  import { ArrowRight, Pencil, Play, Star } from '@lucide/vue'
  import type { MangaPageData } from '~~/server/api/pages/mangas/[id].get'
  import type { WorkStatusOption } from '~/components/work/StatusMenu.vue'
  import { useMangaRate } from '~/features/manga/useMangaRate'
  import {
    MANGA_STATUS_LABEL,
    MANGA_STATUS_ORDER,
    MANGA_STATUS_SUB,
    type MangaRateStatus,
  } from '~/features/manga/rate'
  import { MANGA_STATUS_ICON as STATUS_ICON } from '~/features/rate/status-icon'
  import { getMangaEpisodeLabel } from '~/utils/media/manga'

  defineOptions({ name: 'MangaHeroCta' })

  const props = defineProps<{
    mangaId: number
    title: string
    chapters: MangaPageData['chapters']
    myRate: MangaPageData['my_rate']
    progress: MangaPageData['progress']
    favorited: boolean
  }>()

  const pickerTitle = computed(() => `将「${props.title}」添加到收藏夹`)

  const startTarget = computed(() => {
    const readable = props.chapters.filter(chapter => chapter.readable)
    return [...readable].sort((left, right) => left.sort_key - right.sort_key)[0] ?? null
  })

  const rateCtl = useMangaRate(props.mangaId, props.myRate)

  const statusOptions: WorkStatusOption[] = MANGA_STATUS_ORDER.map(value => ({
    value,
    label: MANGA_STATUS_LABEL[value],
    sub: MANGA_STATUS_SUB[value],
    icon: STATUS_ICON[value],
  }))

  const dialogOpen = ref(false)
  const rateMode = computed<'chip' | 'prompt' | 'hidden'>(() => {
    if (rateCtl.status.value === 'PLAN') return 'hidden'
    if (rateCtl.score.value != null) return 'chip'
    if (rateCtl.status.value != null) return 'prompt'
    return 'hidden'
  })

  function read(chapterId: number) {
    void navigateTo(`/mangas/${props.mangaId}/read/${chapterId}`)
  }
</script>

<template>
  <Inline justify="center" class="lg:justify-start">
    <Button v-if="progress" size="lg" @click="read(progress.chapter.id)">
      <template #icon>
        <Play aria-hidden="true" />
      </template>
      继续阅读 {{ getMangaEpisodeLabel(progress.chapter) }}
    </Button>
    <Button v-else-if="startTarget" size="lg" @click="read(startTarget.id)">
      <template #icon>
        <Play aria-hidden="true" />
      </template>
      开始阅读 {{ getMangaEpisodeLabel(startTarget) }}
    </Button>

    <WorkStatusMenu
      size="lg"
      :tone="progress || startTarget ? 'neutral' : 'accent'"
      :status="rateCtl.status.value"
      :status-private="rateCtl.statusPrivate.value"
      :options="statusOptions"
      :busy="rateCtl.pending.value"
      @select="(value, priv) => rateCtl.setStatus(value as MangaRateStatus, priv)"
      @clear="rateCtl.remove"
      @privacy="rateCtl.setPrivacy"
    />

    <Button
      v-if="rateMode === 'chip'"
      size="lg"
      variant="outline"
      tone="neutral"
      @click="dialogOpen = true"
    >
      <template #icon>
        <Star class="fill-current text-warning" />
      </template>
      {{ rateCtl.score.value?.toFixed(1) }}
      <template #trailing>
        <Pencil class="text-muted" />
      </template>
    </Button>
    <Button
      login-required
      v-else-if="rateMode === 'prompt'"
      size="lg"
      variant="outline"
      tone="neutral"
      @click="dialogOpen = true"
    >
      写个评分
      <template #trailing><ArrowRight /></template>
    </Button>

    <FavoriteToggle
      :id="mangaId"
      type="manga"
      :initial-favorited="favorited"
      variant="icon"
      size="lg"
      :picker-title="pickerTitle"
    />
    <ShareButton :to="`/mangas/${mangaId}`" tooltip="分享" size="lg" />
    <WorkEditButton resource-type="manga" :resource-id="mangaId" size="lg" />

    <MangaRateDialog
      v-model:visible="dialogOpen"
      :rate="rateCtl.rate.value"
      :work-title="title"
      :upsert="rateCtl.upsert"
      :remove="rateCtl.remove"
    />
  </Inline>
</template>
