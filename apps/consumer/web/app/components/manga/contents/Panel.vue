<script setup lang="ts">
  import { Button, Card, Grid, IconButton, Inline, Ripple, Stack, Tag, Text } from '@hina-ui/vue'
  import { ArrowDownUp } from '@lucide/vue'
  import { MANGA_READING_UNITS, mangaChapterLabel } from '@hikarinagi/shared'
  import {
    contentsStatus,
    recentChapters,
    type ContentsItem,
    type ContentsProgress,
  } from '~/features/manga/contents'
  import { useContents } from '~/features/manga/composables/useContents'

  defineOptions({ name: 'MangaContentsPanel' })

  const props = defineProps<{
    mangaId: number
    chapters: ContentsItem[]
    progress: ContentsProgress | null | undefined
    finished: boolean
    latestChapterAt: string | null
  }>()
  const emit = defineEmits<{ refresh: [] }>()

  const contents = useContents(() => props)
  const { units, readIds, currentId, currentPage, signedIn, unit, range, desc } = contents

  const status = computed(() => {
    const text = contentsStatus(units.value, props.finished)
    if (!text || props.finished || !props.latestChapterAt) return text
    return `${text} · ${timeFromNow(props.latestChapterAt)}`
  })
  const editable = computed(() => props.chapters.some(item => item.editable))
  const editing = ref(false)
  const target = ref<ContentsItem | null>(null)
  const dialogOpen = ref(false)

  function select(item: ContentsItem) {
    if (!editing.value) {
      contents.open(item)
      return
    }
    if (!item.editable) return
    target.value = item
    dialogOpen.value = true
  }

  const empty = computed(() => MANGA_READING_UNITS.every(key => !units.value[key].length))
  const recent = computed(() => recentChapters(units.value.chapter))
  const latestId = computed(() => units.value.chapter.at(-1)?.id)
  const shortDay = (iso: string) => `${Number(iso.slice(5, 7))} 月 ${Number(iso.slice(8, 10))} 日`
</script>

<template>
  <Stack v-if="!empty" gap="md">
    <EntrySectionHead id="chapters" title="目录">
      <template #actions>
        <Inline gap="sm" :wrap="false">
          <Text v-if="status" size="sm" tone="muted" class="tabular-nums">{{ status }}</Text>
          <IconButton
            :label="desc ? '正序' : '倒序'"
            size="sm"
            :class="desc ? 'text-accent-text' : undefined"
            @click="desc = !desc"
          >
            <ArrowDownUp />
          </IconButton>
          <Button
            v-if="editable"
            size="sm"
            :variant="editing ? 'solid' : 'soft'"
            :tone="editing ? 'accent' : 'neutral'"
            @click="editing = !editing"
          >
            {{ editing ? '完成' : '编辑' }}
          </Button>
        </Inline>
      </template>
    </EntrySectionHead>

    <Grid v-if="unit === 'chapter' && recent.length" :cols="2" gap="sm" class="lg:grid-cols-4">
      <Card
        v-for="chapter in recent"
        :key="chapter.id"
        as="button"
        type="button"
        class="hn-state-layer hn-interactive text-start hn-press-lg"
        @click="select(chapter)"
      >
        <Ripple />
        <Stack gap="xs">
          <Inline gap="sm" align="center" justify="between" :wrap="false">
            <Text weight="semibold" truncate class="tabular-nums">
              {{ mangaChapterLabel(chapter) }}
            </Text>
            <Tag v-if="chapter.id === latestId" tone="accent">最新</Tag>
          </Inline>
          <Inline gap="none" class="gap-x-3 gap-y-0">
            <Text as="span" size="xs" tone="muted" class="tabular-nums">
              {{ shortDay(chapter.created_at) }}更新
            </Text>
            <Text as="span" size="xs" tone="muted" class="tabular-nums">
              {{ chapter.page_count }} 页
            </Text>
          </Inline>
        </Stack>
      </Card>
    </Grid>

    <MangaContentsBrowser
      v-model:unit="unit"
      v-model:range="range"
      :units="units"
      :current-id="currentId"
      :current-page="currentPage"
      :read-ids="readIds"
      :signed-in="signedIn"
      :desc="desc"
      @select="select"
    />

    <MangaChapterEditDialog
      v-model:visible="dialogOpen"
      :series-id="mangaId"
      :chapter="target"
      @saved="emit('refresh')"
    />
  </Stack>
</template>
