import { toast } from '@hina-ui/vue'
import type {
  BackendMangaBaselinePage,
  BackendMangaCheck,
  BackendMangaNote,
  BackendMangaPage,
  BackendMangaProject,
} from '../manga'
import { projectEpisode } from '../series'
import { MANGA_REVIEW, type MangaReviewContext } from './context'
import { useReviewCheck } from './useReviewCheck'
import { useReviewState } from './useReviewState'

export function useReviewWorkspace(input: {
  project: () => BackendMangaProject
  pages: () => BackendMangaPage[]
  baseline: () => BackendMangaBaselinePage[]
  check: () => BackendMangaCheck | null
  notes: () => BackendMangaNote[]
  narrow: () => boolean
}) {
  const project = computed(input.project)
  const pages = computed(input.pages)
  const baseline = computed(input.baseline)
  const notes = ref<BackendMangaNote[]>(input.notes())
  watch(input.notes, value => {
    notes.value = value
  })
  const { check, rerunning, rerun } = useReviewCheck(() => project.value.id, input.check)
  const state = useReviewState({
    pages: input.pages,
    baseline: input.baseline,
    check: () => check.value,
    notes: () => notes.value,
    narrow: input.narrow,
  })
  const drawing = ref(false)
  const pending: MangaReviewContext['pending'] = ref(null)
  const focus: MangaReviewContext['focus'] = ref(null)

  function startNote() {
    if (drawing.value) {
      drawing.value = false
      return
    }
    if (state.view.value !== 'page') state.open(state.index.value)
    if (state.mode.value === 'swipe') state.mode.value = 'side'
    state.showing.value = 'upload'
    pending.value = null
    drawing.value = true
  }

  function openNote(note: BackendMangaNote) {
    state.openPage(note.page_id)
    focus.value = { page_id: note.page_id, rect: note.rect }
  }

  const context: MangaReviewContext = {
    state,
    project,
    pages,
    baseline,
    check,
    notes,
    drawing,
    pending,
    focus,
    startNote,
    openNote,
  }
  provide(MANGA_REVIEW, context)

  const { confirm } = useHikariConfirm()
  const approving = ref(false)

  function approve() {
    const replaces = project.value.replaces
    const flagged = check.value?.status === 'READY' ? state.counts.value.flagged : 0
    confirm({
      title: replaces ? '通过并替换' : '通过并发布',
      description: `${
        replaces
          ? `审核通过后，本投稿将替换${projectEpisode(project.value)}现有的 ${replaces.page_count} 页，旧页面不予保留。`
          : '批准后，立即将页面发布到本章，读者可以在线阅读。'
      }${flagged ? `检查仍有 ${flagged} 页有标记。` : ''}`,
      confirmText: '通过',
      cancelText: '取消',
      onConfirm: async () => {
        approving.value = true
        try {
          await hikariRequest('/api/v3/manga-projects/{project_id}/approve', {
            method: 'post',
            path: { project_id: project.value.id },
            body: {},
          })
          toast.success(replaces ? '已通过并替换' : '已通过并发布')
          await navigateTo('/create/manga-review')
        } finally {
          approving.value = false
        }
      },
    })
  }

  return { ...context, rerunning, rerun, approve, approving }
}
