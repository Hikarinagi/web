import { HIKARI_BIZ_CODE } from '@hikarinagi/shared'
import type { Ref } from 'vue'
import type { Changeset } from '~/features/creator/editor/changeset'
import { isBlocking, type BackendDuplicateCandidate } from '~/features/creator/duplicates'
import { isApiError } from '~/utils/api/error'

const TRIGGER_FIELDS = new Set([
  'name',
  'name_cn',
  'other_names',
  'origin_title',
  'trans_title',
  'en_title',
  'aliases',
  'trans_name',
  'author_id',
  'bangumi_book_id',
  'bangumi_game_id',
  'bangumi_subject_id',
  'bangumi_id',
  'vndb_id',
  'isbn',
  'series_id',
  'volume_number',
])
const TRIGGER_RELATIONS = new Set(['covers', 'producers', 'staff'])

export function useDuplicateCheck(params: {
  resourceType: string
  enabled: boolean
  changeset: Ref<Changeset>
}) {
  const candidates = ref<BackendDuplicateCandidate[]>([])
  const dismissed = ref<number[]>([])
  const authorWorksChecked = ref(false)
  const checking = ref(false)
  const serverFound = ref(false)
  let seq = 0

  const signature = computed(() =>
    JSON.stringify(
      params.changeset.value.filter(op =>
        op.kind === 'scalar' ? TRIGGER_FIELDS.has(op.field) : TRIGGER_RELATIONS.has(op.relation),
      ),
    ),
  )

  async function run() {
    if (!params.enabled) return
    const current = ++seq
    if (signature.value === '[]') {
      candidates.value = []
      return
    }
    checking.value = true
    try {
      const data = await hikariRequest('/api/v3/contribution/duplicate-checks', {
        method: 'POST',
        body: {
          resource_type: params.resourceType as BackendDuplicateCandidate['resource_type'],
          changeset: params.changeset.value as unknown as Record<string, unknown>[],
        },
        toast: false,
      })
      if (current === seq) candidates.value = data.candidates
    } catch {
      if (current === seq) candidates.value = []
    } finally {
      if (current === seq) checking.value = false
    }
  }

  watchDebounced(signature, run, { debounce: 800 })

  const matches = computed(() => candidates.value.filter(item => item.level !== 'author_work'))
  const authorWorks = computed(() => candidates.value.filter(item => item.level === 'author_work'))
  const onSite = computed(() => candidates.value.filter(item => item.level === 'on_site'))
  const unconfirmed = computed(() =>
    candidates.value.filter(item => item.level === 'likely' && !dismissed.value.includes(item.id)),
  )
  const blocked = computed(
    () =>
      onSite.value.length > 0 ||
      unconfirmed.value.length > 0 ||
      (authorWorks.value.length > 0 && !authorWorksChecked.value),
  )

  function setDismissed(id: number, value: boolean) {
    dismissed.value = value
      ? [...new Set([...dismissed.value, id])]
      : dismissed.value.filter(item => item !== id)
  }

  function absorb(error: unknown): boolean {
    if (!isApiError(error) || error.code !== HIKARI_BIZ_CODE.CHANGE_REQUEST_DUPLICATE_SUSPECTED) {
      return false
    }
    const found = error.details?.candidates
    if (Array.isArray(found)) candidates.value = found as BackendDuplicateCandidate[]
    serverFound.value = true
    return true
  }

  function setAuthorWorksChecked(value: boolean) {
    authorWorksChecked.value = value
  }

  return {
    candidates,
    serverFound,
    setAuthorWorksChecked,
    matches,
    authorWorks,
    onSite,
    unconfirmed,
    blocked,
    dismissed,
    authorWorksChecked,
    checking,
    setDismissed,
    absorb,
    blocking: computed(() => candidates.value.filter(isBlocking)),
  }
}

export type DuplicateCheck = ReturnType<typeof useDuplicateCheck>
