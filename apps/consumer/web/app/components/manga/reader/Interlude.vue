<script setup lang="ts">
  import { ArrowLeft, List } from '@lucide/vue'
  import type { MangaReadPageData } from '~~/server/api/pages/mangas/reader/[id]/[chapterId].get'
  import { getMangaEpisodeLabel } from '~/utils/media/manga'

  defineOptions({ name: 'MangaReaderInterlude' })

  const props = defineProps<{
    mangaId: number
    mangaTitle: string
    chapterLabel: string
    nextChapter: MangaReadPageData['manifest']['next_chapter']
    nextLocked: boolean
    showMarkCta: boolean
    marking: boolean
    light: boolean
  }>()

  const emit = defineEmits<{
    openNext: []
    openCatalog: []
    backToDetail: []
    mark: []
  }>()

  const nextTitle = computed(() => {
    const next = props.nextChapter
    if (!next) return ''
    const label = getMangaEpisodeLabel(next)
    const name = next.chapter_number ? next.name_cn || next.name : null
    return name ? `${label} ${name}` : label
  })

  const strongText = computed(() => (props.light ? 'text-black' : 'text-white'))
  const subtleText = computed(() => (props.light ? 'text-black/50' : 'text-[#8b95a6]'))
  const panelClass = computed(() =>
    props.light ? 'border-black/10 bg-black/5' : 'border-white/10 bg-white/5',
  )
</script>

<template>
  <div class="flex h-full w-full flex-col items-center justify-center gap-7 px-6">
    <div class="flex flex-col items-center gap-4">
      <Tag severity="info">{{ chapterLabel }}</Tag>
      <h2 class="text-2xl font-bold" :class="strongText">本话完</h2>
    </div>

    <Button
      v-if="nextChapter && !nextLocked"
      unstyled
      class="flex w-full max-w-96 cursor-pointer flex-col items-center gap-1.5 rounded-2xl border px-8 py-6 transition-colors"
      :class="[panelClass, light ? 'hover:bg-black/10' : 'hover:bg-white/10']"
      @click="emit('openNext')"
    >
      <span class="text-xs" :class="subtleText">下一话</span>
      <span class="text-[17px] font-semibold" :class="strongText">{{ nextTitle }}</span>
      <span class="text-xs" :class="subtleText">继续翻页进入</span>
    </Button>
    <div
      v-else-if="nextChapter && nextLocked"
      class="flex w-full max-w-96 flex-col items-center gap-3 rounded-2xl border px-8 py-6"
      :class="panelClass"
    >
      <div class="flex flex-col items-center gap-1.5">
        <span class="text-xs" :class="subtleText">下一话</span>
        <span class="text-[17px] font-semibold" :class="strongText">{{ nextTitle }}</span>
        <span class="text-xs" :class="subtleText">
          登录后免费阅读全部章节，还可以随时随地同步阅读进度
        </span>
      </div>
      <Button login-required rounded label="登录 / 注册" class="px-5" />
    </div>
    <div
      v-else
      class="flex w-full max-w-124 flex-col items-center gap-1.5 rounded-2xl border px-8 py-6"
      :class="panelClass"
    >
      <span class="text-[15px] font-medium" :class="strongText">已是最新一话</span>
    </div>

    <Button
      v-if="showMarkCta"
      unstyled
      class="cursor-pointer rounded-full bg-primary/15 px-4 py-2.5 text-[13px] text-primary transition-colors hover:bg-primary/25 disabled:opacity-60"
      :disabled="marking"
      @click="emit('mark')"
    >
      在看这部？标记一下，更新你的状态
    </Button>

    <div class="flex items-center justify-center gap-3">
      <Button
        v-tooltip.bottom="'详情'"
        rounded
        text
        severity="secondary"
        aria-label="详情"
        @click="emit('backToDetail')"
      >
        <template #icon><ArrowLeft :size="19" /></template>
      </Button>
      <Button
        v-tooltip.bottom="'目录'"
        rounded
        text
        severity="secondary"
        aria-label="目录"
        @click="emit('openCatalog')"
      >
        <template #icon><List :size="19" /></template>
      </Button>
      <FavoriteToggle
        :id="mangaId"
        type="manga"
        variant="bar"
        rounded
        :picker-title="`将「${mangaTitle}」添加到收藏夹`"
      />
      <ShareButton :to="`/mangas/${mangaId}`" tooltip="分享" rounded text severity="secondary" />
    </div>
  </div>
</template>
