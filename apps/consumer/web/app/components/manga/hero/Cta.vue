<script setup lang="ts">
  import { DropdownMenuItem, Inline, SplitButton } from '@hina-ui/vue'
  import { ArrowRight, BookOpen, Pencil, RotateCcw, Sparkles, Star } from '@lucide/vue'
  import { mangaChapterLabel } from '@hikarinagi/shared'
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
  import { contentsUnits, continueTarget } from '~/features/manga/contents'

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

  const units = computed(() => contentsUnits(props.chapters))
  const latest = computed(() => units.value.chapter.at(-1) ?? null)
  const first = computed(() => units.value.chapter[0] ?? null)
  const target = computed(() =>
    continueTarget(units.value, props.progress, new Set(props.progress?.read_chapter_ids ?? [])),
  )

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
  <Inline gap="sm" align="center">
    <SplitButton
      v-if="target"
      label="阅读"
      menu-label="更多阅读选项"
      align="start"
      class="w-full sm:w-auto [&>*:first-child]:flex-1"
      @click="read(target.id)"
    >
      <template #icon><BookOpen /></template>
      {{ target.resume ? '继续阅读' : '开始阅读' }} {{ target.label }}
      <template #content>
        <DropdownMenuItem v-if="latest" @select="read(latest.id)">
          <template #icon><Sparkles /></template>
          阅读最新一话（{{ mangaChapterLabel(latest) }}）
        </DropdownMenuItem>
        <DropdownMenuItem v-if="target.resume && first" @select="read(first.id)">
          <template #icon><RotateCcw /></template>
          从{{ mangaChapterLabel(first) }}重新阅读
        </DropdownMenuItem>
      </template>
    </SplitButton>

    <WorkStatusMenu
      :tone="target ? 'neutral' : 'accent'"
      :status="rateCtl.status.value"
      :status-private="rateCtl.statusPrivate.value"
      :options="statusOptions"
      :busy="rateCtl.pending.value"
      @select="(value, priv) => rateCtl.setStatus(value as MangaRateStatus, priv)"
      @clear="rateCtl.remove"
      @privacy="rateCtl.setPrivacy"
    />

    <Button v-if="rateMode === 'chip'" variant="soft" tone="neutral" @click="dialogOpen = true">
      <template #icon>
        <Star class="fill-current text-warning" />
      </template>
      {{ rateCtl.score.value?.toFixed(1) }}
      <template #trailing>
        <Pencil class="text-muted" />
      </template>
    </Button>
    <Button
      v-else-if="rateMode === 'prompt'"
      login-required
      variant="soft"
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
      size="md"
      :picker-title="pickerTitle"
    />
    <ShareButton :to="`/mangas/${mangaId}`" tooltip="分享" size="md" />
    <MangaDownloadAction :id="mangaId" :title="title" :chapters="chapters" />
    <WorkEditButton resource-type="manga" :resource-id="mangaId" />

    <MangaRateDialog
      v-model:visible="dialogOpen"
      :rate="rateCtl.rate.value"
      :work-title="title"
      :upsert="rateCtl.upsert"
      :remove="rateCtl.remove"
    />
  </Inline>
</template>
