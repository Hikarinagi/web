import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Item from '~/components/wiki/changes/Item.vue'
import Withdrawal from '~/components/wiki/diff/Withdrawal.vue'
import { revisionTime } from '~/features/entry/time'
import type { WikiChange, Withdrawal as WithdrawalValue } from '~/features/wiki/changes'

const withdrawal = {
  statement_id: 9787996,
  reason: 'WRONG_ENTRY',
  note: '新增中文简介逐句对应轻小说第一卷简介，而非漫画系列原文简介。',
  sources: [
    {
      url: 'https://www.kadokawa.co.jp/product/322306000868/',
      excerpt: '覚悟しておいてよ。一ヶ月でキミを落としてあげるからさ。',
    },
  ],
  edit_id: 5667,
  editor: { id: 62423, name: 'hoshimi_shion', nickname: '书音' },
  withdrawn_at: '2026-11-16T15:18:27.186Z',
} as unknown as WithdrawalValue

const change = {
  id: 5663,
  editor: { id: 50770, name: 'luhj', nickname: 'luhj' },
  batch: { id: 1, task: null, imported: false, reverted_at: null },
  summary: '修改了中文简介',
  note: null,
  basis: null,
  clause: null,
  created_at: '2026-11-16T15:16:03.571Z',
  applied_at: '2026-11-16T15:16:03.571Z',
  patrolled_at: null,
  reverted_at: null,
  entry_count: 1,
  entries: [
    { id: 72120, type: 'MANGA', label: '女朋友', summary: null, reverted_at: null, revision: 3 },
  ],
} as unknown as WikiChange

describe('WikiDiffWithdrawal', () => {
  it('records when and in which edit a value was withdrawn, by whom, why and against what source', () => {
    const wrapper = mount(Withdrawal, { props: { withdrawal } })
    const lines = wrapper.findAll('p').map(line => line.text())

    expect(lines).toEqual([
      `已于 ${revisionTime(withdrawal.withdrawn_at)} 在另一次修改中作废`,
      '作废人：书音',
      '理由：不属于此条目',
      '说明：新增中文简介逐句对应轻小说第一卷简介，而非漫画系列原文简介。',
      '与之矛盾的来源：https://www.kadokawa.co.jp/product/322306000868/',
      '摘录：「覚悟しておいてよ。一ヶ月でキミを落としてあげるからさ。」',
    ])
    expect(wrapper.findAll('a').map(link => link.attributes('href'))).toEqual([
      '/create/wiki/changes/5667',
      'https://www.kadokawa.co.jp/product/322306000868/',
    ])
  })

  it('leaves out the reason, note and sources the withdrawal did not give', () => {
    const wrapper = mount(Withdrawal, {
      props: { withdrawal: { ...withdrawal, reason: null, note: null, sources: [] } },
    })

    expect(wrapper.findAll('p').map(line => line.text())).toEqual([
      `已于 ${revisionTime(withdrawal.withdrawn_at)} 在另一次修改中作废`,
      '作废人：书音',
    ])
  })
})

describe('WikiChangesItem', () => {
  const render = (value: object) =>
    mount(Item, {
      props: { change: { ...change, ...value } as WikiChange, to: '/create/wiki/changes/5663' },
      global: { stubs: { Avatar: true, UserName: true } },
    })

  it('marks an edit of mine whose values were withdrawn later with how many', () => {
    expect(render({ withdrawn: 2 }).text()).toContain('其中 2 个值已被作废')
  })

  it('shows no mark when none of its values stays withdrawn or the list does not count them', () => {
    expect(render({ withdrawn: 0 }).text()).not.toContain('已被作废')
    expect(render({}).text()).not.toContain('已被作废')
  })
})
