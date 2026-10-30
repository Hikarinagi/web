import { toast } from '@hina-ui/vue'
import type {
  BackendEditCheck,
  BackendEntryDraft,
  BackendEntryLookup,
} from '~/features/creator/entry/contract'
import { isApiError } from '~/utils/api/error'

export interface DraftChoice {
  placement: BackendEntryDraft['placement'] | null
  target: number | null
  medium: string | null
  type: string | null
  title: string
}

const BLOCKING = ['EXCERPT_NOT_FOUND', 'SOURCE_NOT_ALLOWED', 'VALUE_MISMATCH', 'UNREACHABLE']

export function useEntryDraft() {
  const input = ref('')
  const query = ref('')
  const looking = ref(false)
  const lookup = ref<BackendEntryLookup | null>(null)
  const draft = ref<BackendEntryDraft | null>(null)
  const drafting = ref(false)
  const refusal = ref<string | null>(null)
  const check = ref<BackendEditCheck | null>(null)
  const confirmed = ref(false)
  const saving = ref(false)
  const choice = reactive<DraftChoice>({
    placement: null,
    target: null,
    medium: null,
    type: null,
    title: '',
  })

  const similar = computed(() =>
    (lookup.value?.similar ?? []).filter(entry => entry.id !== draft.value?.target?.id),
  )
  const failures = computed(() =>
    (check.value?.statements ?? []).flatMap(statement => {
      const verification = statement.citations.at(-1)?.verification
      return verification && BLOCKING.includes(verification) ? [verification] : []
    }),
  )
  const ready = computed(
    () =>
      Boolean(draft.value?.operations.length) &&
      !failures.value.length &&
      !check.value?.violations.length &&
      !check.value?.locked.length &&
      (confirmed.value || !similar.value.length),
  )

  async function find() {
    const text = input.value.trim()
    if (!text) return
    query.value = text
    looking.value = true
    lookup.value = null
    draft.value = null
    refusal.value = null
    check.value = null
    confirmed.value = false
    Object.assign(choice, { placement: null, target: null, medium: null, type: null, title: '' })
    try {
      lookup.value = await hikariRequest('/api/v3/wiki/entries/lookups', {
        method: 'POST',
        body: { input: text },
      })
      const source = lookup.value.source
      choice.title = source?.title ?? ''
      if (source?.kind === 'url' && !source.record_key) choice.type = 'GAME'
      if (lookup.value.source?.record_key && !lookup.value.matches.length) await build()
    } finally {
      looking.value = false
    }
  }

  async function build() {
    drafting.value = true
    refusal.value = null
    check.value = null
    try {
      draft.value = await hikariRequest('/api/v3/wiki/entries/drafts', {
        method: 'POST',
        body: {
          input: query.value,
          placement: choice.placement ?? undefined,
          target: choice.target ?? undefined,
          medium: (choice.medium as 'LIGHT_NOVEL' | 'MANGA' | null) ?? undefined,
          type: (choice.type as 'GAME' | 'PERSON' | 'ORGANIZATION' | null) ?? undefined,
          title: choice.title.trim() || undefined,
        },
        toast: false,
      })
      choice.placement = draft.value.placement
      choice.target = draft.value.target?.id ?? null
      choice.medium = draft.value.medium
      if (draft.value.operations.length)
        check.value = await hikariRequest('/api/v3/wiki/edits/checks', {
          method: 'POST',
          body: { operations: draft.value.operations, base: [], clause: draft.value.clause },
          toast: false,
        })
    } catch (error) {
      if (!isApiError(error)) throw error
      draft.value = null
      const reason = error.details?.reason
      refusal.value = typeof reason === 'string' ? reason : error.message
    } finally {
      drafting.value = false
    }
  }

  async function create() {
    const current = draft.value
    if (!current || !ready.value) return
    saving.value = true
    try {
      const result = await hikariRequest('/api/v3/wiki/edits', {
        method: 'POST',
        body: { operations: current.operations, base: [], clause: current.clause },
      })
      if (result.status !== 'APPLIED') return navigateTo('/create/notices')
      const creates = current.operations.filter(operation => operation.op === 'create_entry')
      const created = [...result.entries].sort((a, b) => a - b).slice(-creates.length)
      const primary =
        current.placement === 'new_game'
          ? 'GAME'
          : current.placement === 'version' || current.placement === 'addon'
            ? 'PRODUCT'
            : current.placement === 'page'
              ? creates[0]?.type
              : 'BOOK'
      const index = Math.max(
        creates.findIndex(operation => operation.type === primary),
        0,
      )
      toast.success('已新建条目')
      return navigateTo(`/create/edit/entry/${created[index]}`)
    } finally {
      saving.value = false
    }
  }

  return {
    input,
    looking,
    lookup,
    draft,
    drafting,
    refusal,
    check,
    failures,
    similar,
    confirmed,
    saving,
    choice,
    ready,
    find,
    build,
    create,
  }
}
