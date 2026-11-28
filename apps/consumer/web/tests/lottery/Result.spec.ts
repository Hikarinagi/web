import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Result from '../../app/components/lottery/detail/Result.vue'
import type { BackendLottery } from '~/features/lottery/lottery'

const lottery: BackendLottery = {
  id: 1,
  title: '新年抽奖',
  phase: 'ANNOUNCED',
  organizer: {
    id: 2,
    name: 'host',
    nickname: null,
    avatar: null,
    equipped_badges: [],
    equipped_frame: null,
    role: 'USER',
  },
  post_id: 3,
  published_at: '2026-11-01T00:00:00.000Z',
  starts_at: '2026-11-01T00:00:00.000Z',
  draws_at: '2026-11-20T12:00:00.000Z',
  announce_by: '2026-11-21T12:00:00.000Z',
  announce_hours: 24,
  claim_days: 7,
  standby_count: 0,
  refill: false,
  min_account_days: 30,
  contact: 'host@example.com',
  participant_count: 10,
  seed_hash: null,
  seed: null,
  prizes: [],
  conditions: [],
  preset_label: '发表过 3 篇评分',
  viewer: { joined: true, ineligible: null, result: null },
}

const result = (
  overrides: Partial<NonNullable<BackendLottery['viewer']['result']>>,
): NonNullable<BackendLottery['viewer']['result']> => ({
  kind: 'LOST',
  winner_id: null,
  prize_id: null,
  status: null,
  claim_by: null,
  standby_rank: null,
  exclusion: null,
  revoke_note: null,
  ...overrides,
})

const render = (value: NonNullable<BackendLottery['viewer']['result']>) =>
  mount(Result, { props: { lottery, result: value, prize: null } })

describe('LotteryDetailResult', () => {
  it('explains an exclusion from its enum with the lottery data it depends on', () => {
    const age = render(result({ kind: 'EXCLUDED', exclusion: 'NEW_ACCOUNT' }))
    expect(age.text()).toContain('没有中奖资格')
    expect(age.text()).toContain('截至开奖时注册不满 30 天')

    const preset = render(result({ kind: 'EXCLUDED', exclusion: 'PRESET_UNMET' }))
    expect(preset.text()).toContain('不满足资格条件「发表过 3 篇评分」')
  })

  it('shows a revoked prize with the reason the organizer gave', () => {
    const wrapper = render(result({ kind: 'REVOKED', revoke_note: '重复账号' }))
    expect(wrapper.text()).toContain('中奖资格已取消')
    expect(wrapper.text()).toContain('重复账号')
    expect(wrapper.text()).not.toContain('没有中奖')
  })

  it('falls back to a plain line when nothing was won', () => {
    expect(render(result({ kind: 'LOST' })).text()).toBe('没有中奖')
  })
})
