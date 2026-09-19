<script setup lang="ts">
  import { Center, Popover, ScrollArea, SimpleGrid, Skeleton, Stack } from '@hina-ui/vue'
  import type { Editor } from '@tiptap/vue-3'
  import { useEditorOverlays } from '../../composables/useEditorOverlays'
  import { EDITOR_PLUGIN_CONTEXT_KEY } from '../../plugins/types'
  import { useUserEmojiCatalog, type Emoji } from './composables/useUserEmojiCatalog'
  import { useEmojiRecent, type RecentEmoji } from './composables/useEmojiRecent'
  import { recordEmojiUsage } from './composables/useEmojiUsageRecorder'
  import { useTabScrollSync } from './picker/composables/useTabScrollSync'

  defineOptions({ name: 'HikariEditorPluginsEmojiPicker' })

  const props = defineProps<{ editor: Editor }>()

  const { closeOverlay } = useEditorOverlays()
  const { sets, refresh: refreshCatalog } = useUserEmojiCatalog()
  const { items: recent, loaded: recentLoaded, refresh: refreshRecent } = useEmojiRecent()
  const editorCtx = inject(EDITOR_PLUGIN_CONTEXT_KEY, null)

  onMounted(() => {
    void refreshCatalog()
    void refreshRecent()
  })

  const sectionIds = computed(() => ['recent', ...sets.value.map(s => `set-${s.id}`)])
  const scrollerRef = useTemplateRef<{ viewport: HTMLElement | null }>('scrollerRef')
  const { activeId, onTabClick } = useTabScrollSync({
    scroller: scrollerRef,
    sectionIds,
    initialId: 'recent',
  })

  function snapshotIntoDocSets(setName: string) {
    const docRef = editorCtx?.documentEmojiSetsRef
    if (!docRef) return
    const fromCatalog = sets.value.find(s => s.name === setName)
    if (!fromCatalog) return
    // upsert by id:线程已有的 set 可能是后端按已用 code 裁剪过的
    // 直接替换为目录里的完整集，保证刚选中的表情(及 src)进入 doc 快照
    docRef.value = [
      ...docRef.value.filter(s => s.id !== fromCatalog.id),
      {
        id: fromCatalog.id,
        name: fromCatalog.name,
        visibility: fromCatalog.visibility,
        subscribable: !fromCatalog.is_default && !fromCatalog.is_owned,
        emojis: fromCatalog.emojis,
      },
    ]
  }

  function insertEmoji(setName: string, emojiName: string, emojiId: number) {
    snapshotIntoDocSets(setName)
    props.editor
      .chain()
      .focus()
      .insertContent({
        type: 'emoji_inline',
        attrs: { emoji_code: `${setName}:${emojiName}` },
      })
      .run()
    recordEmojiUsage(emojiId)
    closeOverlay('emoji-picker')
  }

  function onPickFromSet(emoji: Emoji, setName: string) {
    insertEmoji(setName, emoji.name, emoji.id)
  }

  function onPickFromRecent(emoji: RecentEmoji) {
    insertEmoji(emoji.set_name, emoji.name, emoji.id)
  }

  const previewOpen = ref(false)
  const preview = shallowRef<{
    src: string | null
    name: string
    setName: string | null
    anchor: HTMLElement
  } | null>(null)

  function showPreview(emoji: Emoji, setName: string | null, anchor: HTMLElement) {
    preview.value = { src: emoji.src?.src ?? null, name: emoji.name, setName, anchor }
    previewOpen.value = true
  }
</script>

<template>
  <Stack gap="sm" class="min-h-0 grow px-(--hn-panel-p) pb-(--hn-panel-p) sm:w-80 sm:px-0 sm:pb-0">
    <HikariEditorPluginsEmojiPickerTabBar
      :sets="sets"
      :active-id="activeId"
      class="border-b pb-1 max-sm:order-last max-sm:border-t max-sm:border-b-0 max-sm:pt-1 max-sm:pb-0"
      @select="onTabClick"
    >
      <template #trailing>
        <HikariEditorPluginsEmojiPickerManageButton />
      </template>
    </HikariEditorPluginsEmojiPickerTabBar>

    <ScrollArea ref="scrollerRef" class="min-h-0 grow sm:h-80 sm:grow-0">
      <HikariEditorPluginsEmojiPickerSection id="recent" title="最近使用">
        <SimpleGrid v-if="!recentLoaded" min="2.5rem" gap="xs" class="p-1">
          <Center v-for="i in 14" :key="i" class="size-10">
            <Skeleton class="size-8 rounded-sm" />
          </Center>
        </SimpleGrid>
        <HikariEditorPluginsEmojiPickerRecentEmpty v-else-if="!recent.length" />
        <HikariEditorPluginsEmojiPickerEmojiGrid
          v-else
          :emojis="recent"
          @pick="onPickFromRecent"
          @preview="(emoji, anchor) => showPreview(emoji, emoji.set_name, anchor)"
        />
      </HikariEditorPluginsEmojiPickerSection>

      <HikariEditorPluginsEmojiPickerSection
        v-for="set in sets"
        :id="`set-${set.id}`"
        :key="set.id"
        :title="set.name"
      >
        <HikariEditorPluginsEmojiPickerEmojiGrid
          :emojis="set.emojis"
          @pick="emoji => onPickFromSet(emoji, set.name)"
          @preview="(emoji, anchor) => showPreview(emoji, set.name, anchor)"
        />
      </HikariEditorPluginsEmojiPickerSection>
    </ScrollArea>

    <Popover
      v-model:open="previewOpen"
      :anchor="preview?.anchor ?? null"
      :modal="false"
      side="top"
      :padded="false"
      class="p-3"
      @open-auto-focus="event => event.preventDefault()"
    >
      <template #content>
        <HikariEditorPluginsEmojiPickerPreview
          v-if="preview"
          :src="preview.src"
          :name="preview.name"
          :set-name="preview.setName"
        />
      </template>
    </Popover>
  </Stack>
</template>
