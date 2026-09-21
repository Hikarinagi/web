<script setup lang="ts">
  import { Card, Heading, Inline, Ripple, Stack, Tag, Text } from '@hina-ui/vue'
  import { ArrowLeft, List } from '@lucide/vue'
  import { cn } from '~/utils/cn'
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

  const strongText = computed(() => (props.light ? 'text-neutral-1000' : 'text-neutral-0'))
  const subtleText = computed(() => (props.light ? 'text-neutral-1000/50' : 'text-neutral-400'))
  const panelClass = computed(() =>
    props.light ? 'border-neutral-1000/10 bg-neutral-1000/5' : 'border-neutral-0/10 bg-neutral-0/5',
  )
  const panelHover = computed(() =>
    props.light ? 'hover:bg-neutral-1000/10' : 'hover:bg-neutral-0/10',
  )
  const markClass = computed(() =>
    props.light
      ? 'bg-brand-500/15 text-brand-700 hover:bg-brand-500/25'
      : 'bg-brand-400/15 text-brand-400 hover:bg-brand-400/25',
  )
  const panelBase = 'w-full max-w-96 flex-col items-center rounded-2xl px-8 py-6 shadow-none'
</script>

<template>
  <Stack align="center" justify="center" gap="none" class="h-full w-full gap-7 px-6">
    <Stack align="center" gap="md">
      <Tag tone="info">{{ chapterLabel }}</Tag>
      <Heading :level="2" size="2xl" :class="cn('font-bold', strongText)">本话完</Heading>
    </Stack>

    <Card
      v-if="nextChapter && !nextLocked"
      as="button"
      :padded="false"
      :class="cn('hn-state-layer flex hn-interactive gap-1.5', panelBase, panelClass, panelHover)"
      @click="emit('openNext')"
    >
      <Ripple />
      <Text as="span" size="xs" :class="subtleText">下一话</Text>
      <Text as="span" size="md" weight="semibold" :class="strongText">{{ nextTitle }}</Text>
      <Text as="span" size="xs" :class="subtleText">继续翻页进入</Text>
    </Card>

    <Card
      v-else-if="nextChapter && nextLocked"
      :padded="false"
      :class="cn('flex gap-3', panelBase, panelClass)"
    >
      <Stack align="center" gap="none" class="gap-1.5">
        <Text as="span" size="xs" :class="subtleText">下一话</Text>
        <Text as="span" size="md" weight="semibold" :class="strongText">{{ nextTitle }}</Text>
        <Text as="span" size="xs" :class="subtleText">
          登录后免费阅读全部章节，还可以随时随地同步阅读进度
        </Text>
      </Stack>
      <Button login-required pill class="px-5">登录 / 注册</Button>
    </Card>

    <Card v-else :padded="false" :class="cn('flex max-w-124 gap-1.5', panelBase, panelClass)">
      <Text as="span" size="sm" weight="medium" :class="strongText">已是最新一话</Text>
    </Card>

    <Button
      v-if="showMarkCta"
      variant="ghost"
      pill
      :class="cn('px-4', markClass)"
      :disabled="marking"
      @click="emit('mark')"
    >
      在看这部？标记一下，更新你的状态
    </Button>

    <Inline justify="center" :wrap="false">
      <IconButton label="详情" side="bottom" pill :class="strongText" @click="emit('backToDetail')">
        <ArrowLeft />
      </IconButton>
      <IconButton label="目录" side="bottom" pill :class="strongText" @click="emit('openCatalog')">
        <List />
      </IconButton>
      <FavoriteToggle
        :id="mangaId"
        type="manga"
        variant="bar"
        pill
        :picker-title="`将「${mangaTitle}」添加到收藏夹`"
      />
      <ShareButton :to="`/mangas/${mangaId}`" tooltip="分享" pill />
    </Inline>
  </Stack>
</template>
