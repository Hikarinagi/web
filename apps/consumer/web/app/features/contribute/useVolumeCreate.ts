import type { BackendEditOperation, BackendEntryDraft } from '~/features/creator/entry/contract'
import { isApiError } from '~/utils/api/error'

export function useVolumeCreate(series: () => { id: number }) {
  const method = ref<'isbn' | 'manual'>('isbn')
  const isbn = ref('')
  const number = ref('')
  const title = ref('')
  const draft = ref<BackendEntryDraft | null>(null)
  const notice = ref<string | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  let entry: number | null = null

  const seriesEntry = async () =>
    (entry ??= (
      await hikariRequest('/api/v3/wiki/resources/{kind}/{id}', {
        path: { kind: 'manga', id: series().id },
      })
    ).entry_id)

  function reset() {
    method.value = 'isbn'
    isbn.value = ''
    number.value = ''
    title.value = ''
    draft.value = null
    notice.value = null
    entry = null
  }

  async function read() {
    const input = isbn.value.trim()
    draft.value = null
    notice.value = null
    if (!input) return
    loading.value = true
    try {
      const lookup = await hikariRequest('/api/v3/wiki/entries/lookups', {
        method: 'POST',
        body: { input },
      })
      if (lookup.matches.length) {
        notice.value = '本站已有使用该 ISBN 的书。请从列表中选择其卷。'
        return
      }
      const target = await seriesEntry()
      const ruled = await hikariRequest('/api/v3/wiki/entries/drafts', {
        method: 'POST',
        body: { input },
        toast: false,
      })
      if (ruled.placement === 'volume') {
        notice.value = '本书是已有卷的另一版本。请从列表中选择该卷。'
        return
      }
      draft.value =
        ruled.placement === 'series' && ruled.target?.id === target
          ? ruled
          : await hikariRequest('/api/v3/wiki/entries/drafts', {
              method: 'POST',
              body: { input, placement: 'series', target },
              toast: false,
            })
    } catch (error) {
      if (!isApiError(error)) throw error
      notice.value =
        error.details?.reason === 'no_record' ? '无法读取该 ISBN 的书目资料。' : error.message
    } finally {
      loading.value = false
    }
  }

  const operations = async (): Promise<{ operations: BackendEditOperation[]; clause: string }> => {
    if (method.value === 'isbn' && draft.value)
      return { operations: draft.value.operations, clause: draft.value.clause }
    const target = await seriesEntry()
    return {
      clause: '5.2',
      operations: [
        { op: 'create_entry', ref: 'v', type: 'VOLUME' },
        { op: 'add', entry_ref: 'v', property: 'SERIES', value: { target } },
        { op: 'add', entry_ref: 'v', property: 'TITLE', value: { text: title.value.trim() } },
        ...(number.value.trim()
          ? [
              {
                op: 'add' as const,
                entry_ref: 'v',
                property: 'VOLUME_NUMBER' as const,
                value: { text: number.value.trim() },
              },
            ]
          : []),
      ],
    }
  }

  async function create(): Promise<number | null> {
    saving.value = true
    try {
      const body = await operations()
      const result = await hikariRequest('/api/v3/wiki/edits', {
        method: 'POST',
        body: { ...body, base: [] },
      })
      const creates = body.operations.filter(operation => operation.op === 'create_entry')
      const created = [...result.entries].sort((a, b) => a - b).slice(-creates.length)
      const volume = created[creates.findIndex(operation => operation.type === 'VOLUME')]
      if (volume === undefined) return null
      for (let attempt = 0; attempt < 20; attempt++) {
        const page = await hikariRequest('/api/v3/wiki/entries/{id}', { path: { id: volume } })
        if (page.resource?.kind === 'manga_volume') return page.resource.id
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      return null
    } finally {
      saving.value = false
    }
  }

  return { method, isbn, number, title, draft, notice, loading, saving, reset, read, create }
}
