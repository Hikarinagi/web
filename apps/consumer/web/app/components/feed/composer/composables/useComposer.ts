import {
  EDITOR_SCHEMA_VERSION,
  POST_PRESET,
  type EditorDocument,
  type PollNodeAttrs,
} from '@hikarinagi/editor-schema'
import type { ApiData } from '@hikarinagi/api-contract/v3'
import { useTiptap } from '~/components/hikari-editor/composables/useTiptap'
import { emptyEditorSummaries } from '~/components/hikari-editor/composables/useEditorSummaries'
import { useEditorPlugins } from '~/components/hikari-editor/plugins'
import type { ToolbarDropdownItem } from '~/components/hikari-editor/plugins'
import { usePollEditor } from '~/features/interaction/usePollEditor'
import { usePollEdit } from '~/features/interaction/usePollEdit'
import { useUserEmojiCatalog } from '~/components/hikari-editor/plugins/emoji/composables/useUserEmojiCatalog'
import {
  buildContentEmojiIndex,
  provideContentEmojiSets,
  type EmojiSetDisplay,
} from '~/components/hikari-content/composables/useContentEmojiSets'
import {
  provideContentSummaries,
  type EntitySummaries,
  type PollCardSummary,
} from '~/components/hikari-content/composables/useContentSummaries'
import { useMediaLibrary } from '~/components/media-library/composables/useMediaLibrary'
import type { MediaValue } from '~/components/media-library/types'
import { sectionStoreId, topicStoreId } from '~/features/feed/sources'
import { usePrependFeed } from '~/features/feed/useFeedStream'
import type { FeedItemByType } from '~/features/feed/feed'

export const POST_MAX_COVERS = 9
export const POST_MAX_TOPICS = 5
export const POST_MAX_RELATED_WORKS = 10
const TITLE_MAX = 200

export interface ComposerTopic {
  id: number
  name: string
}

export interface ComposerWork {
  work_type: 'GALGAME' | 'LIGHT_NOVEL' | 'MANGA'
  id: number
  title: string
}

type CreatedPost = ApiData<'/api/v3/posts', 'post'>
type PostDetail = ApiData<'/api/v3/posts/{id}', 'get'>

function firstLine(text: string): string {
  const head = text.trim().split(/\n+/)[0]?.trim() ?? ''
  return head.slice(0, TITLE_MAX)
}

function pollNodeJson(def: PollNodeAttrs) {
  return {
    type: 'poll',
    attrs: {
      poll_key: def.poll_key,
      question: def.question,
      options: def.options,
      allow_multiple: def.allow_multiple,
      max_choices: def.max_choices,
      anonymous: def.anonymous,
      allow_change: def.allow_change,
      closes_at: def.closes_at,
    },
  }
}

export function useComposer(
  options: { topic?: ComposerTopic; sectionId?: number; editId?: number } = {},
) {
  const isEdit = computed(() => options.editId != null)
  const summariesRef = ref(emptyEditorSummaries())
  provideContentSummaries(() => summariesRef.value)
  const documentEmojiSetsRef = ref<EmojiSetDisplay[]>([])
  const { sets: userCatalogSets } = useUserEmojiCatalog()
  provideContentEmojiSets(() =>
    buildContentEmojiIndex({
      documentSets: documentEmojiSetsRef.value,
      userCatalogSets: userCatalogSets.value,
    }),
  )

  const plugins = useEditorPlugins('post')
  const title = ref('')
  const covers = ref<MediaValue[]>([])
  const topics = ref<ComposerTopic[]>([])
  const relatedWorks = ref<ComposerWork[]>([])
  const sectionIds = ref<number[]>(options.sectionId != null ? [options.sectionId] : [])

  const isEmpty = ref(true)
  const charCount = ref(0)
  const charLimit = POST_PRESET.limits.max_plain_text_chars
  const overLimit = computed(() => charCount.value > charLimit)
  const titleOverLimit = computed(() => title.value.length > TITLE_MAX)
  const selectionEmpty = ref(true)
  const spoilerActive = ref(false)
  const pollDef = ref<PollNodeAttrs | null>(null)
  const materializedPoll = ref<PollCardSummary | null>(null)
  const pendingEditDoc = ref<EditorDocument | null>(null)
  const hasPoll = computed(() => pollDef.value !== null)
  const submitting = ref(false)
  const pendingTopics = ref(0)
  let tempTopicSeq = 0

  const coversFull = computed(() => covers.value.length >= POST_MAX_COVERS)
  const topicsFull = computed(() => topics.value.length >= POST_MAX_TOPICS)
  const relatedWorksFull = computed(() => relatedWorks.value.length >= POST_MAX_RELATED_WORKS)
  const hasContent = computed(
    () => !isEmpty.value || covers.value.length > 0 || pollDef.value !== null,
  )
  const canPublish = computed(
    () =>
      hasContent.value &&
      !overLimit.value &&
      !titleOverLimit.value &&
      !submitting.value &&
      pendingTopics.value === 0,
  )

  const { open: openLibrary } = useMediaLibrary()
  async function openCoverLibrary() {
    const remaining = POST_MAX_COVERS - covers.value.length
    if (remaining <= 0) return
    const picks = await openLibrary({ mode: 'multiple', max: remaining })
    if (!picks.length) return
    const known = new Set(covers.value.map(m => m.id))
    covers.value = [...covers.value, ...picks.filter(m => !known.has(m.id))].slice(
      0,
      POST_MAX_COVERS,
    )
  }

  function addTopic(topic: ComposerTopic) {
    if (topicsFull.value || topics.value.some(t => t.id === topic.id)) return
    topics.value = [...topics.value, topic]
  }
  function removeTopic(id: number) {
    topics.value = topics.value.filter(t => t.id !== id)
  }
  async function createTopic(rawName: string) {
    const name = rawName.replace(/^#+/, '').trim()
    if (!name || topicsFull.value) return
    if (topics.value.some(t => t.name.toLowerCase() === name.toLowerCase())) return
    const tempId = -++tempTopicSeq
    topics.value = [...topics.value, { id: tempId, name }]
    pendingTopics.value++
    try {
      const created = await hikariRequest('/api/v3/topics', { method: 'post', body: { name } })
      topics.value = topics.value
        .map(t => (t.id === tempId ? { id: created.id, name: created.name } : t))
        .filter((t, i, arr) => arr.findIndex(x => x.id === t.id) === i)
    } catch {
      topics.value = topics.value.filter(t => t.id !== tempId)
    } finally {
      pendingTopics.value--
    }
  }

  function addWork(work: ComposerWork) {
    if (
      relatedWorksFull.value ||
      relatedWorks.value.some(w => w.work_type === work.work_type && w.id === work.id)
    )
      return
    relatedWorks.value = [...relatedWorks.value, work]
  }
  function removeWork(work: ComposerWork) {
    relatedWorks.value = relatedWorks.value.filter(
      w => !(w.work_type === work.work_type && w.id === work.id),
    )
  }

  function trySubmit(): boolean {
    void publish()
    return true
  }

  const DRAFT_KEY = 'hikari:feed-composer:draft'
  function snapshot() {
    const ed = editor.value
    if (!ed) return null
    if (ed.isEmpty && covers.value.length === 0 && !title.value.trim() && !pollDef.value)
      return null
    return {
      content_json: ed.getJSON(),
      title: title.value,
      covers: covers.value,
      topics: topics.value.filter(t => t.id > 0),
      related_works: relatedWorks.value,
      summaries: summariesRef.value,
      emoji_sets: documentEmojiSetsRef.value,
      poll: pollDef.value,
    }
  }
  function saveDraft() {
    if (!import.meta.client || isEdit.value) return
    const snap = snapshot()
    if (snap) localStorage.setItem(DRAFT_KEY, JSON.stringify(snap))
    else localStorage.removeItem(DRAFT_KEY)
  }
  const saveDraftDebounced = useDebounceFn(saveDraft, 500)
  function restoreDraft() {
    if (!import.meta.client) return
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return
    try {
      const d = JSON.parse(raw)
      if (typeof d.title === 'string') title.value = d.title
      if (Array.isArray(d.covers)) covers.value = d.covers
      if (Array.isArray(d.topics)) topics.value = d.topics
      if (Array.isArray(d.related_works)) relatedWorks.value = d.related_works
      if (d.summaries) summariesRef.value = d.summaries
      if (Array.isArray(d.emoji_sets)) documentEmojiSetsRef.value = d.emoji_sets
      if (d.content_json) editor.value?.commands.setContent(d.content_json)
      if (d.poll) pollDef.value = d.poll as PollNodeAttrs
    } catch {
      localStorage.removeItem(DRAFT_KEY)
    }
  }

  const { editor, pluginContext } = useTiptap({
    plugins,
    summariesRef,
    documentEmojiSetsRef,
    placeholder: '分享你的发现、推荐、打卡…',
    editorProps: {
      handleKeyDown(_view, event) {
        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) return trySubmit()
        return false
      },
    },
    onUpdate({ isEmpty: empty, charCount: count }) {
      isEmpty.value = empty
      charCount.value = count
      updateInlineState()
      saveDraftDebounced()
    },
    onSelectionUpdate() {
      updateInlineState()
    },
  })

  watch(editor, ed => {
    if (!ed) return
    if (isEdit.value) {
      if (pendingEditDoc.value) {
        ed.commands.setContent(pendingEditDoc.value)
        pendingEditDoc.value = null
      }
      return
    }
    restoreDraft()
    // 进入话题/板块页时预填该话题 tag(板块无 chip UI,仅在提交时带上 section_id)。
    if (options.topic) addTopic(options.topic)
  })
  watch([title, covers, topics, relatedWorks], () => saveDraftDebounced(), { deep: true })

  function updateInlineState() {
    const ed = editor.value
    if (!ed) {
      selectionEmpty.value = true
      spoilerActive.value = false
      return
    }
    selectionEmpty.value = ed.state.selection.empty
    spoilerActive.value = ed.isActive('spoiler')
  }

  const { open: openPollDialog } = usePollEditor()
  const { edit: editMaterializedPoll } = usePollEdit()
  function openPoll() {
    const mat = materializedPoll.value
    if (mat) {
      editMaterializedPoll(mat, res => {
        materializedPoll.value = res
        pollDef.value = {
          poll_key: res.poll_key,
          question: res.question,
          options: res.options.map(o => o.label),
          allow_multiple: res.allow_multiple,
          max_choices: res.max_choices,
          anonymous: res.anonymous,
          allow_change: res.allow_change,
          closes_at: res.closes_at,
        }
      })
      return
    }
    const existing = pollDef.value
    openPollDialog({
      mode: existing ? 'edit' : 'create',
      initial: existing,
      onSave: def => {
        pollDef.value = { ...def, poll_key: existing?.poll_key ?? crypto.randomUUID() }
      },
    })
  }
  function removePoll() {
    pollDef.value = null
    materializedPoll.value = null
  }

  const emojiPlugin = plugins.find(p => p.id === 'emoji')
  function openEmojiPicker(event: MouseEvent) {
    const ed = editor.value
    const anchor = event.currentTarget as HTMLElement | null
    if (!ed || !anchor || !emojiPlugin?.toolbarItem?.onClick) return
    emojiPlugin.toolbarItem.onClick(ed, pluginContext, anchor)
  }

  function openMentionPicker() {
    editor.value?.chain().focus().insertContent('@').run()
  }

  function toggleSpoiler() {
    const ed = editor.value
    if (!ed || selectionEmpty.value) return
    ed.chain().focus().toggleMark('spoiler').run()
    updateInlineState()
  }

  const entityCardItems: ToolbarDropdownItem[] =
    plugins.find(p => p.id === 'entity-card')?.toolbarItem?.dropdownItems ?? []
  function openEntityCard(item: ToolbarDropdownItem, anchor: HTMLElement) {
    const ed = editor.value
    if (!ed) return
    item.onClick(ed, pluginContext, anchor)
  }

  const prependFeed = usePrependFeed()
  // 在话题/板块页发帖,乐观插入也要补到当前关系流(已 tag,刷新本会出现,这里即时呈现)。
  const prependRelation = options.topic
    ? usePrependFeed(topicStoreId(options.topic.id))
    : options.sectionId
      ? usePrependFeed(sectionStoreId(options.sectionId))
      : null

  function toFeedItem(post: CreatedPost): FeedItemByType<'post'> {
    return {
      type: 'post',
      id: post.id,
      pinned: false,
      sort_time: post.created_at,
      author: post.creator,
      title: post.title,
      excerpt: post.content_meta?.excerpt ?? null,
      covers: post.covers.map(c => c.media),
      cover_count: post.covers.length,
      view_count: post.view_count ?? 0,
      like_count: post.like_count ?? 0,
      liked: false,
      favorited: false,
      comment_count: 0,
      hot_comment: null,
      work_refs: [],
      poll: post.entity_summaries?.polls?.[0] ?? null,
    }
  }

  function reset() {
    editor.value?.commands.clearContent()
    title.value = ''
    covers.value = []
    topics.value = []
    relatedWorks.value = []
    pollDef.value = null
    summariesRef.value = emptyEditorSummaries()
    documentEmojiSetsRef.value = []
    if (import.meta.client) localStorage.removeItem(DRAFT_KEY)
  }

  function load(detail: PostDetail) {
    title.value = detail.title
    covers.value = detail.covers.map(c => ({
      id: c.media.id,
      src: c.media.src,
      width: c.media.width,
      height: c.media.height,
    }))
    topics.value = detail.topics.map(t => ({ id: t.topic.id, name: t.topic.name }))
    relatedWorks.value = (detail.manual_related_works ?? []).map(w => ({
      work_type: w.work_type,
      id: w.id,
      title: w.title,
    }))
    sectionIds.value = detail.sections.map(s => s.section.id)
    summariesRef.value = detail.entity_summaries as EntitySummaries
    documentEmojiSetsRef.value = (detail.emoji_sets ?? []) as EmojiSetDisplay[]
    const doc = detail.content_json as unknown as EditorDocument | null
    const pollNode = doc?.content?.find(n => n.type === 'poll')
    if (pollNode) {
      pollDef.value = pollNode.attrs as unknown as PollNodeAttrs
      materializedPoll.value = detail.entity_summaries.polls[0] ?? null
    }
    const bodyDoc =
      doc?.content != null
        ? ({ ...doc, content: doc.content.filter(n => n.type !== 'poll') } as EditorDocument)
        : doc
    if (bodyDoc) {
      if (editor.value) editor.value.commands.setContent(bodyDoc)
      else pendingEditDoc.value = bodyDoc
    }
  }

  async function publish() {
    const ed = editor.value
    if (!ed || !canPublish.value) return
    submitting.value = true
    try {
      const doc = ed.getJSON() as { type: string; content?: unknown[] }
      const content_json = pollDef.value
        ? { ...doc, content: [...(doc.content ?? []), pollNodeJson(pollDef.value)] }
        : doc
      const resolvedTitle = title.value.trim() || firstLine(ed.getText()) || '分享'
      const topicIds = topics.value.filter(t => t.id > 0).map(t => t.id)
      if (isEdit.value && options.editId != null) {
        await hikariRequest<'/api/v3/posts/{id}', 'patch'>('/api/v3/posts/{id}', {
          method: 'patch',
          path: { id: options.editId },
          body: {
            title: resolvedTitle,
            content_json: content_json as unknown as Record<string, unknown>,
            client_schema_version: EDITOR_SCHEMA_VERSION,
            cover_ids: covers.value.map(c => c.id),
            section_ids: sectionIds.value,
            topic_ids: topicIds,
            related_works: relatedWorks.value.map(w => ({ work_type: w.work_type, id: w.id })),
          },
        })
        return true
      }
      const created = await hikariRequest<'/api/v3/posts', 'post'>('/api/v3/posts', {
        method: 'post',
        body: {
          title: resolvedTitle,
          content_json: content_json as unknown as Record<string, unknown>,
          client_schema_version: EDITOR_SCHEMA_VERSION,
          cover_ids: covers.value.map(c => c.id),
          section_ids: sectionIds.value,
          topic_ids: topicIds,
          related_works: relatedWorks.value.map(w => ({ work_type: w.work_type, id: w.id })),
          status: 'published',
        },
      })
      const feedItem = toFeedItem(created)
      prependFeed(feedItem)
      prependRelation?.(feedItem)
      reset()
      return true
    } finally {
      submitting.value = false
    }
  }

  return {
    editor,
    plugins,
    title,
    covers,
    topics,
    relatedWorks,
    isEmpty,
    charCount,
    charLimit,
    overLimit,
    titleOverLimit,
    selectionEmpty,
    spoilerActive,
    hasPoll,
    pollDef,
    submitting,
    coversFull,
    topicsFull,
    relatedWorksFull,
    hasContent,
    canPublish,
    openCoverLibrary,
    addTopic,
    removeTopic,
    createTopic,
    addWork,
    removeWork,
    openEmojiPicker,
    openMentionPicker,
    toggleSpoiler,
    openPoll,
    removePoll,
    entityCardItems,
    openEntityCard,
    load,
    publish,
    reset,
  }
}

export type ComposerHost = ReturnType<typeof useComposer>
