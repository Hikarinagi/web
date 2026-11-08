<script setup lang="ts">
  import {
    Button,
    Heading,
    Inline,
    Stack,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Text,
  } from '@hina-ui/vue'
  import { ChevronRight } from '@lucide/vue'
  import {
    MANGA_READING_UNITS,
    MANGA_READING_UNIT_NAME,
    type MangaReadingUnit,
  } from '@hikarinagi/shared'
  import {
    contentsStatus,
    type ContentsItem,
    type ContentsProgress,
  } from '~/features/manga/contents'
  import { useContents } from '~/features/manga/composables/useContents'

  defineOptions({ name: 'MangaContentsStrip' })

  const props = defineProps<{
    mangaId: number
    chapters: ContentsItem[]
    progress: ContentsProgress | null | undefined
    finished: boolean
    latestChapterAt: string | null
  }>()

  const contents = useContents(() => props)
  const { units, readIds, currentId, currentPage, signedIn, unit, range } = contents
  const available = computed(() => MANGA_READING_UNITS.filter(key => units.value[key].length))
  const status = computed(() => {
    const text = contentsStatus(units.value, props.finished)
    if (!text || props.finished || !props.latestChapterAt) return text
    return `${text} · ${timeFromNow(props.latestChapterAt)}`
  })
  const sheetOpen = ref(false)

  function select(item: ContentsItem) {
    sheetOpen.value = false
    contents.open(item)
  }
</script>

<template>
  <Stack v-if="available.length" gap="sm">
    <Inline gap="sm" :wrap="false">
      <Heading :level="2" class="text-lg">目录</Heading>
      <TruncatedText
        v-if="status"
        :text="status"
        size="sm"
        tone="muted"
        class="min-w-0 flex-1 tabular-nums"
      />
      <Button variant="ghost" tone="neutral" size="sm" class="ms-auto" @click="sheetOpen = true">
        全部
        <template #trailing><ChevronRight /></template>
      </Button>
    </Inline>
    <Tabs
      v-if="available.length > 1"
      :model-value="unit"
      variant="underline"
      @update:model-value="unit = ($event as MangaReadingUnit) ?? unit"
    >
      <TabsList label="阅读单位">
        <TabsTrigger v-for="key in available" :key="key" :value="key">
          {{ MANGA_READING_UNIT_NAME[key] }}
          <Text as="span" size="sm" tone="faint" class="tabular-nums">
            {{ units[key].length }}
          </Text>
        </TabsTrigger>
      </TabsList>
      <TabsContent v-for="key in available" :key="key" :value="key" class="pt-3">
        <MangaContentsRow
          :unit="key"
          :units="units"
          :current-id="currentId"
          :current-page="currentPage"
          :read-ids="readIds"
          :signed-in="signedIn"
          @select="select"
        />
      </TabsContent>
    </Tabs>
    <MangaContentsRow
      v-else
      :unit="available[0]!"
      :units="units"
      :current-id="currentId"
      :current-page="currentPage"
      :read-ids="readIds"
      :signed-in="signedIn"
      @select="select"
    />
    <MangaContentsSheet
      v-model:open="sheetOpen"
      v-model:unit="unit"
      v-model:range="range"
      :units="units"
      :status="status"
      :current-id="currentId"
      :current-page="currentPage"
      :read-ids="readIds"
      :signed-in="signedIn"
      @select="select"
    />
  </Stack>
</template>
