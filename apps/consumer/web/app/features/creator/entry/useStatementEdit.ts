import type {
  BackendEditCheck,
  BackendEditOperation,
  BackendPropertyDefinition,
  BackendSource,
  BackendStatement,
} from './contract'
import type { StatementValues } from './schemas/statement.schema'
import { HIKARI_BIZ_CODE } from '@hikarinagi/shared'
import { SONG_ROLES } from '~/features/entry/labels'
import { isApiError, showApiErrorToast } from '~/utils/api/error'
import { uploadImage } from '~/components/media-library/lib/upload'
import type { MediaValue } from '~/components/media-library/types'

const BLOCKING = new Set(['EXCERPT_NOT_FOUND', 'SOURCE_NOT_ALLOWED', 'VALUE_MISMATCH'])
const PRECISION = { 4: 'YEAR', 7: 'MONTH', 10: 'DAY' } as const
const LENGTH = { YEAR: 4, MONTH: 7, DAY: 10 } as const

export function useStatementEdit(options: {
  entry: { id: number; revision: number; type: string }
  definition: BackendPropertyDefinition
  statement: BackendStatement | null
  code?: string | null
}) {
  const { entry, definition, statement } = options
  const values = reactive<StatementValues>({
    text: statement?.text ?? '',
    code: statement?.code ?? options.code ?? '',
    date: statement?.date?.slice(0, LENGTH[statement.date_precision ?? 'DAY']) ?? '',
    amount: statement?.amount ?? '',
    currency: statement?.currency ?? 'JPY',
    tax:
      statement?.tax_included === true
        ? 'included'
        : statement?.tax_included === false
          ? 'excluded'
          : 'unknown',
    method: 'link',
    source: '',
    excerpt: '',
    version: null,
    location: '',
    note: '',
    target: statement?.target?.id ?? null,
    reading: statement?.reading ?? '',
    song: statement?.song ?? '',
    song_kind: statement?.song_kind ?? '',
    part: statement?.part ?? '',
    period_from:
      statement?.period_from?.slice(0, LENGTH[statement.period_from_precision ?? 'DAY']) ?? '',
    period_to: statement?.period_to?.slice(0, LENGTH[statement.period_to_precision ?? 'DAY']) ?? '',
  })
  const initial = { ...values }
  const source = ref<BackendSource | null>(null)
  const shots = ref<{ media: MediaValue; name: string }[]>([])
  const uploading = ref(false)
  const reading = ref(false)
  const check = ref<BackendEditCheck | null>(null)
  const checking = ref(false)
  const saving = ref(false)
  const base = ref(entry.revision)
  const retryAt = ref<string | null>(null)
  const refusal = ref<{ reason: string | null; message: string } | null>(null)

  const value = computed(() => {
    const shape = definition.shape
    if (shape === 'date')
      return values.date
        ? {
            date: values.date.padEnd(10, values.date.length === 4 ? '-01-01' : '-01'),
            date_precision: PRECISION[values.date.length as 4 | 7 | 10],
          }
        : null
    if (shape === 'money')
      return values.amount
        ? {
            amount: values.amount,
            currency: values.currency,
            tax_included: values.tax === 'unknown' ? null : values.tax === 'included',
          }
        : null
    if (shape === 'code' || shape === 'language') return values.code ? { code: values.code } : null
    if (shape === 'entry')
      return values.target && (values.code || !definition.codes || definition.optional_code)
        ? {
            target: values.target,
            code: values.code || null,
            ...(definition.note ? { text: values.text || null } : {}),
          }
        : null
    if (shape === 'credit') {
      const sung = SONG_ROLES.includes(values.code)
      return values.code && values.text
        ? {
            code: values.code,
            text: values.text,
            reading: values.reading || null,
            role: statement?.role ?? null,
            song: sung ? values.song || null : null,
            song_kind: sung ? values.song_kind || null : null,
            target: values.target,
          }
        : null
    }
    if (shape === 'identifier')
      return values.text ? { code: values.code || null, text: values.text } : null
    return values.text
      ? {
          text: values.text,
          ...(definition.reading ? { reading: values.reading || null } : {}),
        }
      : null
  })
  const allowed = new Set(definition.qualifiers)
  const qualifiers = computed(() => ({
    ...(allowed.has('part') ? { part: values.part || null } : {}),
    ...(allowed.has('period')
      ? {
          period_from: values.period_from
            ? values.period_from.padEnd(10, values.period_from.length === 4 ? '-01-01' : '-01')
            : null,
          period_from_precision: values.period_from
            ? PRECISION[values.period_from.length as 4 | 7 | 10]
            : null,
          period_to: values.period_to
            ? values.period_to.padEnd(10, values.period_to.length === 4 ? '-01-01' : '-01')
            : null,
          period_to_precision: values.period_to
            ? PRECISION[values.period_to.length as 4 | 7 | 10]
            : null,
        }
      : {}),
  }))
  const original = {
    value: JSON.stringify(value.value),
    qualifiers: JSON.stringify(qualifiers.value),
  }
  const citations = computed(() => {
    if (values.method === 'screenshot')
      return shots.value.length
        ? [
            {
              method: 'SCREENSHOT' as const,
              media: shots.value.map(shot => shot.media.id),
              version: values.version,
              location: values.location || null,
            },
          ]
        : []
    if (source.value?.record_key)
      return [
        { method: 'RECORD' as const, record_key: source.value.record_key, url: source.value.url },
      ]
    if (values.source && /^https?:\/\//i.test(values.source))
      return [{ method: 'EXCERPT' as const, url: values.source, excerpt: values.excerpt || null }]
    return []
  })
  const operations = computed<BackendEditOperation[]>(() => {
    if (!value.value) return []
    const extra = Object.keys(qualifiers.value).length ? { qualifiers: qualifiers.value } : {}
    if (!statement)
      return [
        {
          op: 'add',
          entry: entry.id,
          property: definition.property,
          value: value.value,
          citations: citations.value,
          ...extra,
        },
      ]
    if (JSON.stringify(value.value) !== original.value)
      return [
        {
          op: 'modify',
          statement: statement.id,
          value: value.value,
          citations: citations.value,
          ...extra,
        },
      ]
    return [
      ...(JSON.stringify(qualifiers.value) !== original.qualifiers
        ? [{ op: 'modify' as const, statement: statement.id, ...extra }]
        : []),
      ...(citations.value.length
        ? [{ op: 'cite' as const, statement: statement.id, citations: citations.value }]
        : []),
    ]
  })
  const body = computed(() => ({
    operations: operations.value,
    base: [{ entry_id: entry.id, revision: base.value }],
    ...(values.note ? { note: values.note } : {}),
  }))
  const blocked = computed(() => {
    const result = check.value
    if (!result) return true
    return (
      result.locked.length > 0 ||
      result.conflicts.length > 0 ||
      result.violations.length > 0 ||
      result.statements.some(item =>
        item.citations.some(citation => BLOCKING.has(citation.verification)),
      )
    )
  })

  function prefill(force: boolean) {
    const value = source.value?.values.find(
      item => item.property === definition.property && item.entry_type === entry.type,
    )?.value
    if (!value) return
    const fill = (key: 'text' | 'code' | 'date' | 'amount' | 'currency', next: unknown) => {
      if (
        (typeof next === 'string' || typeof next === 'number') &&
        (force || values[key] === initial[key])
      )
        values[key] = String(next)
    }
    fill('text', value.text)
    fill('code', value.code)
    fill('amount', value.amount)
    fill('currency', value.currency)
    if (typeof value.date === 'string')
      fill(
        'date',
        value.date.slice(
          0,
          LENGTH[(value.date_precision as keyof typeof LENGTH | undefined) ?? 'DAY'],
        ),
      )
    if (typeof value.tax_included === 'boolean' && (force || values.tax === initial.tax))
      values.tax = value.tax_included ? 'included' : 'excluded'
  }

  async function upload(files: File[]) {
    uploading.value = true
    try {
      for (const file of files) {
        const media = await uploadImage(file)
        if (media) shots.value = [...shots.value, { media, name: file.name }]
      }
    } finally {
      uploading.value = false
    }
  }

  async function read() {
    const input = values.source.trim()
    source.value = null
    if (!input) return
    reading.value = true
    try {
      source.value = await hikariRequest('/api/v3/wiki/sources', {
        method: 'POST',
        body: { input },
        toast: false,
      })
      if (!statement) prefill(false)
    } catch {
      source.value = null
    } finally {
      reading.value = false
    }
  }

  async function verify() {
    refusal.value = null
    if (!operations.value.length) {
      check.value = null
      return
    }
    checking.value = true
    try {
      check.value = await hikariRequest('/api/v3/wiki/edits/checks', {
        method: 'POST',
        body: body.value,
        toast: false,
      })
    } catch (error) {
      if (!isApiError(error)) throw error
      check.value = null
      const reason = error.details?.reason
      refusal.value = { reason: typeof reason === 'string' ? reason : null, message: error.message }
    } finally {
      checking.value = false
    }
  }

  async function save() {
    saving.value = true
    retryAt.value = null
    try {
      await hikariRequest('/api/v3/wiki/edits', { method: 'POST', body: body.value, toast: false })
      return true
    } catch (error) {
      if (!isApiError(error)) throw error
      if (error.code === HIKARI_BIZ_CODE.COMMON_RATE_LIMITED)
        retryAt.value = typeof error.details?.retry_at === 'string' ? error.details.retry_at : null
      else if (error.code === HIKARI_BIZ_CODE.WIKI_EDIT_CONFLICT) await verify()
      else showApiErrorToast(error)
      return false
    } finally {
      saving.value = false
    }
  }

  function rebase(revision: number) {
    base.value = revision
    return verify()
  }

  return {
    values,
    source,
    shots,
    uploading,
    upload,
    reading,
    check,
    checking,
    saving,
    blocked,
    retryAt,
    refusal,
    read,
    adopt: () => prefill(true),
    verify,
    save,
    rebase,
  }
}
