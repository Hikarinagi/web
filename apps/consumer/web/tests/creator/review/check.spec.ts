import { describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'
import { checkTags, type BackendChangeRequestCheck } from '../../../app/features/creator/check'
import { useCheckChoices } from '../../../app/features/creator/composables/useCheckChoices'
import type { BackendChangeRequestDetail } from '../../../app/features/creator/contribution'

type Verification = NonNullable<BackendChangeRequestCheck['verification']>

function check(verification: Partial<Verification>, status = 'DONE'): BackendChangeRequestCheck {
  return {
    id: 1,
    status,
    disputed: true,
    finished_at: null,
    created_at: '2026-10-17T05:45:00Z',
    verification: {
      identity: { kind: 'new', id: null, title: null, verified: false },
      summary: '',
      evidence: [],
      fields: [],
      entities: [],
      sources: [],
      mismatches: 0,
      ...verification,
    },
  } as BackendChangeRequestCheck
}

const FIELD = {
  field: 'name',
  submitted: '二分之一的生命',
  submitted_display: '二分之一的生命',
  value: 'ニブンノ・イノチ',
  display: 'ニブンノ・イノチ',
  source: null,
  verified: true,
} as Verification['fields'][number]

const ENTITY = {
  change_request_id: 2949,
  resource_type: 'PRODUCER',
  name: '富士见文库',
  fields: ['bunko_id'],
  existing_id: 8,
  existing_name: '富士見ファンタジア文庫',
  reason: '',
  verified: true,
} as Verification['entities'][number]

describe('checkTags', () => {
  it('names the entry already on the site and the label to use instead', () => {
    expect(
      checkTags(
        check({
          identity: { kind: 'site', id: 5984, title: 'x', verified: true },
          entities: [ENTITY],
        }),
      ),
    ).toEqual([
      { text: '已收录 #5984', tone: 'warning' },
      { text: '文库：可改用 #8', tone: 'neutral' },
    ])
  })

  it('counts verified differences for a new book', () => {
    expect(checkTags(check({ mismatches: 4 }))).toEqual([
      { text: '与原版不符 4 处', tone: 'warning' },
    ])
  })

  it('shows a running or failed check', () => {
    expect(checkTags(check({}, 'RUNNING'))).toEqual([{ text: '核对中', tone: 'neutral' }])
    expect(checkTags(check({}, 'TIMED_OUT'))).toEqual([{ text: '未能核对', tone: 'danger' }])
  })
})

describe('useCheckChoices', () => {
  it('preselects only verified values and follows the reviewer choice', async () => {
    const unverified = { ...FIELD, field: 'publication_date', verified: false }
    const detail = ref({
      check: check({ fields: [FIELD, unverified], entities: [ENTITY] }),
    } as unknown as BackendChangeRequestDetail)
    const choices = useCheckChoices(() => detail.value)
    expect(choices.overrides.value).toEqual([{ field: 'name', value: 'ニブンノ・イノチ' }])
    expect(choices.entityChoices.value).toEqual([{ change_request_id: 2949, use_id: 8 }])
    expect(choices.count.value).toBe(2)

    choices.fields.value = { name: 'request' }
    choices.entities.value = { 2949: 'new' }
    await nextTick()
    expect(choices.count.value).toBe(0)
  })
})
