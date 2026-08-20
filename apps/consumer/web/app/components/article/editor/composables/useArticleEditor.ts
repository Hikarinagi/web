import { EDITOR_SCHEMA_VERSION, type EditorDocument } from '@hikarinagi/editor-schema'
import type { ApiData } from '@hikarinagi/api-contract/v3'
import type { Ref } from 'vue'
import { useTiptap } from '~/components/hikari-editor/composables/useTiptap'
import { emptyEditorSummaries } from '~/components/hikari-editor/composables/useEditorSummaries'
import { useEditorPlugins } from '~/components/hikari-editor/plugins'
import { useUserEmojiCatalog } from '~/components/hikari-editor/plugins/emoji/composables/useUserEmojiCatalog'
import {
  buildContentEmojiIndex,
  provideContentEmojiSets,
  type EmojiSetDisplay,
} from '~/components/hikari-content/composables/useContentEmojiSets'
import {
  provideContentSummaries,
  type EntitySummaries,
} from '~/components/hikari-content/composables/useContentSummaries'
import { useMediaLibrary } from '~/components/media-library/composables/useMediaLibrary'
import type { MediaValue } from '~/components/media-library/types'
import type { TopicValue } from '~/components/topic/useTopics'

type ArticleDetail = ApiData<'/api/v3/articles/{id}', 'get'>

export type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export interface ArticleReviewContext {
  galgameRateId: number | null
  lightNovelRateId: number | null
  workTitle: string | null
}

export interface ArticleWork {
  work_type: 'GALGAME' | 'LIGHT_NOVEL'
  id: number
  title: string
}

const MAX_TOPICS = 5
// 对齐帖子侧 POST_MAX_RELATED_WORKS 与后端 CreateArticleDto 的 ArrayMaxSize(10)
export const ARTICLE_MAX_RELATED_WORKS = 10

export function useArticleEditor(articleId: Ref<number | null>, review?: ArticleReviewContext) {
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

  const plugins = useEditorPlugins('community')
  const title = ref('')
  const cover = ref<MediaValue | null>(null)
  const topics = ref<TopicValue[]>([])
  const relatedWorks = ref<ArticleWork[]>([])
  const visible = ref<'PUBLIC' | 'PRIVATE'>('PUBLIC')
  const allowComment = ref(true)
  const relatedGalgameRateId = ref<number | null>(review?.galgameRateId ?? null)
  const relatedLightNovelRateId = ref<number | null>(review?.lightNovelRateId ?? null)
  const reviewWorkTitle = ref<string | null>(review?.workTitle ?? null)
  const isReview = computed(
    () => relatedGalgameRateId.value != null || relatedLightNovelRateId.value != null,
  )

  const isEmpty = ref(true)
  const charCount = ref(0)
  const saveState = ref<SaveState>('idle')
  const savedAt = ref<Date | null>(null)
  const status = ref<ArticleDetail['status'] | null>(null)
  const publishing = ref(false)
  const pendingTopics = ref(0)
  let tempTopicSeq = 0
  let hydrating = false

  const topicsFull = computed(() => topics.value.length >= MAX_TOPICS)
  const relatedWorksFull = computed(() => relatedWorks.value.length >= ARTICLE_MAX_RELATED_WORKS)
  const hasContent = computed(() => !!title.value.trim() || !isEmpty.value)
  const canPublish = computed(
    () =>
      !!title.value.trim() &&
      !isEmpty.value &&
      !publishing.value &&
      saveState.value !== 'saving' &&
      pendingTopics.value === 0,
  )

  function addTopic(topic: TopicValue) {
    if (topicsFull.value || topics.value.some(t => t.id === topic.id)) return
    topics.value = [...topics.value, topic]
  }
  function removeTopic(id: number) {
    topics.value = topics.value.filter(t => t.id !== id)
  }
  function addWork(work: ArticleWork) {
    if (
      relatedWorksFull.value ||
      relatedWorks.value.some(w => w.work_type === work.work_type && w.id === work.id)
    )
      return
    relatedWorks.value = [...relatedWorks.value, work]
  }
  function removeWork(work: ArticleWork) {
    relatedWorks.value = relatedWorks.value.filter(
      w => !(w.work_type === work.work_type && w.id === work.id),
    )
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

  async function doSave(opts?: { toast?: boolean }) {
    const ed = editor.value
    if (!ed || !hasContent.value) return
    const toast = opts?.toast ?? false
    saveState.value = 'saving'
    try {
      const body = {
        title: title.value.trim(),
        content_json: ed.getJSON() as Record<string, unknown>,
        client_schema_version: EDITOR_SCHEMA_VERSION,
        cover_id: cover.value?.id ?? null,
        // P05:发布设置不再选板块,提交固定空数组(后端 CreateArticleDto.section_ids 必填)
        section_ids: [] as number[],
        topic_ids: topics.value.filter(t => t.id > 0).map(t => t.id),
        related_works: relatedWorks.value.map(w => ({ work_type: w.work_type, id: w.id })),
        visible: visible.value,
        allow_comment: (allowComment.value ? 'ALLOW' : 'DISALLOW') as 'ALLOW' | 'DISALLOW',
      }
      if (articleId.value == null) {
        const created = await hikariRequest<'/api/v3/articles', 'post'>('/api/v3/articles', {
          method: 'post',
          body: {
            ...body,
            status: 'draft',
            ...(relatedGalgameRateId.value != null
              ? { related_galgame_rate_id: relatedGalgameRateId.value }
              : {}),
            ...(relatedLightNovelRateId.value != null
              ? { related_light_novel_rate_id: relatedLightNovelRateId.value }
              : {}),
          },
          toast,
        })
        articleId.value = created.id
        status.value = created.status
      } else {
        const saved = await hikariRequest<'/api/v3/articles/{id}', 'patch'>(
          '/api/v3/articles/{id}',
          {
            method: 'patch',
            path: { id: articleId.value },
            body,
            toast,
          },
        )
        status.value = saved.status
      }
      saveState.value = 'saved'
      savedAt.value = new Date()
    } catch (error) {
      saveState.value = 'error'
      throw error
    }
  }

  const saveDebounced = useDebounceFn(() => {
    if (!publishing.value) void doSave().catch(() => {})
  }, 800)
  function scheduleSave() {
    if (hydrating) return
    if (hasContent.value) saveDebounced()
  }

  const { editor, pluginContext } = useTiptap({
    plugins,
    summariesRef,
    documentEmojiSetsRef,
    placeholder: '开始写点什么…',
    onUpdate({ isEmpty: empty, charCount: count }) {
      isEmpty.value = empty
      charCount.value = count
      scheduleSave()
    },
  })

  watch([title, cover, topics, relatedWorks, visible, allowComment], scheduleSave, { deep: true })

  const { open: openLibrary } = useMediaLibrary()
  async function openCoverLibrary() {
    const picks = await openLibrary({ mode: 'single' })
    if (picks[0]) cover.value = picks[0]
  }
  function removeCover() {
    cover.value = null
  }

  async function load(detail: ArticleDetail) {
    hydrating = true
    articleId.value = detail.id
    title.value = detail.title
    cover.value = detail.cover
      ? {
          id: detail.cover.id,
          src: detail.cover.src,
          width: detail.cover.width,
          height: detail.cover.height,
        }
      : null
    topics.value = (detail.topics ?? []).map(t => ({ id: t.topic.id, name: t.topic.name }))
    relatedWorks.value = (detail.manual_related_works ?? []).flatMap(w =>
      w.work_type === 'MANGA' ? [] : [{ work_type: w.work_type, id: w.id, title: w.title }],
    )
    visible.value = detail.visible
    allowComment.value = detail.allow_comment !== 'DISALLOW'
    relatedGalgameRateId.value = detail.related_galgame_rate_id ?? null
    relatedLightNovelRateId.value = detail.related_light_novel_rate_id ?? null
    status.value = detail.status
    summariesRef.value = detail.entity_summaries as EntitySummaries
    documentEmojiSetsRef.value = (detail.emoji_sets ?? []) as EmojiSetDisplay[]
    if (detail.content_json) {
      editor.value?.commands.setContent(detail.content_json as unknown as EditorDocument)
    }
    saveState.value = 'saved'
    savedAt.value = new Date(detail.updated_at)
    await nextTick()
    hydrating = false
  }

  async function publish() {
    if (!canPublish.value) return
    publishing.value = true
    try {
      await doSave({ toast: true })
      if (articleId.value == null) return
      const published = await hikariRequest<'/api/v3/articles/{id}/publish', 'post'>(
        '/api/v3/articles/{id}/publish',
        { method: 'post', path: { id: articleId.value } },
      )
      status.value = published.status
      if (published.status === 'PUBLISHED') {
        await navigateTo(`/articles/${published.id}`)
      } else if (published.creator?.id) {
        await navigateTo(`/space/${published.creator.id}?tab=articles`)
      }
    } catch {
      /* empty */
    } finally {
      publishing.value = false
    }
  }

  async function discard() {
    if (articleId.value == null) return
    await hikariRequest<'/api/v3/articles/{id}', 'delete'>('/api/v3/articles/{id}', {
      method: 'delete',
      path: { id: articleId.value },
      toast: false,
    })
  }

  return {
    editor,
    plugins,
    pluginContext,
    title,
    cover,
    topics,
    topicsFull,
    relatedWorks,
    relatedWorksFull,
    visible,
    allowComment,
    isEmpty,
    charCount,
    saveState,
    savedAt,
    status,
    publishing,
    hasContent,
    canPublish,
    isReview,
    reviewWorkTitle,
    addTopic,
    removeTopic,
    createTopic,
    addWork,
    removeWork,
    openCoverLibrary,
    removeCover,
    load,
    publish,
    discard,
  }
}

export type ArticleEditorHost = ReturnType<typeof useArticleEditor>
