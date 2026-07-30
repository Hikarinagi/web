<script setup lang="ts">
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
    // 直接替换为目录里的完整集,保证刚选中的表情(及 src)进入 doc 快照
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
</script>

<template>
  <div class="flex flex-col gap-2 md:w-[320px]">
    <HikariEditorPluginsEmojiPickerTabBar :sets="sets" :active-id="activeId" @select="onTabClick">
      <template #trailing>
        <HikariEditorPluginsEmojiPickerManageButton />
      </template>
    </HikariEditorPluginsEmojiPickerTabBar>

    <ScrollArea ref="scrollerRef" class="grow md:h-80 md:grow-0">
      <HikariEditorPluginsEmojiPickerSection id="recent" title="最近使用">
        <div
          v-if="!recentLoaded"
          class="grid grid-cols-[repeat(auto-fill,minmax(40px,1fr))] gap-1 p-1"
        >
          <div v-for="i in 14" :key="i" class="flex h-10 w-10 items-center justify-center">
            <Skeleton width="2rem" height="2rem" />
          </div>
        </div>
        <HikariEditorPluginsEmojiPickerRecentEmpty v-else-if="!recent.length" />
        <HikariEditorPluginsEmojiPickerEmojiGrid v-else :emojis="recent" @pick="onPickFromRecent" />
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
        />
      </HikariEditorPluginsEmojiPickerSection>
    </ScrollArea>
  </div>
</template>
