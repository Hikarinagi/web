import { toast } from '@hina-ui/vue'
import { stripNovelMarkup } from '@hikarinagi/shared'
import { provideContentSummaries } from '~/components/hikari-content/composables/useContentSummaries'
import type { EmojiSetDisplay } from '~/components/hikari-content/composables/useContentEmojiSets'
import { emptyEditorSummaries } from '~/components/hikari-editor/composables/useEditorSummaries'
import { useTiptap } from '~/components/hikari-editor/composables/useTiptap'
import { useEditorPlugins } from '~/components/hikari-editor/plugins'
import { isApiError } from '~/utils/api/error'
import {
  diffBlocks,
  docToBlocks,
  segmentsToDoc,
  type DocNode,
  type SavedSegment,
} from '~/features/workbench/segment-doc'
import type { BackendNovelSegment, NovelSegmentChange } from '~/features/workbench/workbench'

export type ChapterSaveStatus = 'saved' | 'dirty' | 'saving' | 'conflict' | 'error'

export function useChapterEditor(options: {
  chapterId: number
  segments: BackendNovelSegment[]
  editable: boolean
}) {
  const auth = useAuthStore()
  const summariesRef = ref(emptyEditorSummaries())
  provideContentSummaries(() => summariesRef.value)
  const documentEmojiSetsRef = ref<EmojiSetDisplay[]>([])
  const plugins = useEditorPlugins('novel_chapter')

  const saved = shallowRef(new Map<string, SavedSegment>())
  const status = ref<ChapterSaveStatus>('saved')
  const remoteChanged = ref(false)
  const chars = ref(0)
  let revision = 0

  function remember(segments: BackendNovelSegment[]) {
    saved.value = new Map(
      segments.map(segment => [
        segment.id,
        {
          id: segment.id,
          kind: segment.kind,
          text: segment.text,
          image_id: segment.image?.id ?? null,
          caption: segment.caption,
          sort_key: segment.sort_key,
          version: segment.version,
        },
      ]),
    )
    chars.value = segments.reduce(
      (sum, segment) => sum + stripNovelMarkup(segment.text ?? '').length,
      0,
    )
  }
  remember(options.segments)

  async function save() {
    const ed = editor.value
    if (!ed || status.value === 'saving' || status.value === 'conflict') return
    const started = revision
    const blocks = docToBlocks(ed.getJSON() as DocNode)
    const { upserts, deletes } = diffBlocks(blocks, saved.value)
    if (!upserts.length && !deletes.length) {
      status.value = 'saved'
      return
    }
    status.value = 'saving'
    try {
      const result = await hikariRequest('/api/v3/novel-chapters/{chapter_id}/segments', {
        method: 'put',
        path: { chapter_id: options.chapterId },
        body: {
          upserts: upserts.map(block => ({
            id: block.id,
            sort_key: block.sort_key,
            kind: block.kind,
            text: block.text,
            image_id: block.image_id,
            caption: block.caption,
            ...(block.base_version ? { base_version: block.base_version } : {}),
          })),
          deletes,
        },
        toast: false,
      })
      const versions = new Map(result.versions.map(item => [item.id, item.version]))
      const next = new Map(saved.value)
      for (const id of result.deleted) next.delete(id)
      for (const { base_version: _base, ...block } of upserts) {
        next.set(block.id, { ...block, version: versions.get(block.id) ?? 1 })
      }
      saved.value = next
      chars.value = blocks.reduce(
        (sum, block) => sum + stripNovelMarkup(block.text ?? '').length,
        0,
      )
      status.value = revision === started ? 'saved' : 'dirty'
      if (status.value === 'dirty') void scheduleSave()
    } catch (error) {
      const conflict =
        isApiError(error) &&
        (error.code === 'NOVEL_SEGMENT_CONFLICT' || error.code === 'NOVEL_SEGMENT_LOCKED')
      status.value = conflict ? 'conflict' : 'error'
      toast.danger(
        conflict ? '另一位成员同时修改了这一章。编辑前请重新加载。' : '保存失败。稍后将重试。',
      )
      if (!conflict) void scheduleSave()
    }
  }
  const scheduleSave = useDebounceFn(() => save(), 1500)

  onBeforeUnmount(() => {
    if (status.value === 'dirty') void save()
  })

  const { editor, pluginContext } = useTiptap({
    plugins,
    summariesRef,
    documentEmojiSetsRef,
    initialContent: segmentsToDoc(options.segments),
    editable: options.editable,
    placeholder: '在这里开始输入文字。按 Enter 键开始一个新段落。',
  })

  watch(editor, (ed, _previous, onCleanup) => {
    if (!ed) return
    const count = useThrottleFn(
      () => {
        chars.value = docToBlocks(ed.getJSON() as DocNode).reduce(
          (sum, block) => sum + stripNovelMarkup(block.text ?? '').length,
          0,
        )
      },
      500,
      true,
    )
    const onUpdate = () => {
      void count()
      revision += 1
      if (status.value === 'conflict') return
      status.value = 'dirty'
      void scheduleSave()
    }
    ed.on('update', onUpdate)
    onCleanup(() => ed.off('update', onUpdate))
  })

  useEventListener('beforeunload', event => {
    if (status.value === 'dirty' || status.value === 'saving') event.preventDefault()
  })

  async function reload() {
    const segments = await hikariRequest('/api/v3/novel-chapters/{chapter_id}/segments', {
      path: { chapter_id: options.chapterId },
    })
    remember(segments)
    editor.value?.commands.setContent(segmentsToDoc(segments) as never, { emitUpdate: false })
    status.value = 'saved'
    remoteChanged.value = false
  }

  function applyChange(change: NovelSegmentChange) {
    if (change.chapter_id !== options.chapterId || change.kind !== 'source') return
    if (change.actor_id === auth.user?.id) return
    if (status.value === 'saved') void reload()
    else remoteChanged.value = true
  }

  return { editor, pluginContext, plugins, status, remoteChanged, chars, save, reload, applyChange }
}
