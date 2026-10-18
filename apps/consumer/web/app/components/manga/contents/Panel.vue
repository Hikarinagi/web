<script setup lang="ts">
  import { Button, IconButton, Inline, Panel, Text } from '@hina-ui/vue'
  import { ArrowDownUp } from '@lucide/vue'
  import { MANGA_READING_UNITS } from '@hikarinagi/shared'
  import {
    contentsStatus,
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
</script>

<template>
  <Panel v-if="!empty" title="目录">
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
  </Panel>
</template>
