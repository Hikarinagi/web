import { describe, expect, it } from 'vitest'
import { buildInfoRows } from '../../app/features/entity/info'
import type { CharacterDetail, EntityLabel } from '../../app/features/entity/entity'

function character(overrides: Partial<CharacterDetail> = {}): CharacterDetail {
  return {
    id: 27,
    name: '神山識',
    gender: '女',
    birthday_month: 7,
    birthday_day: 4,
    height: 144,
    weight: 36,
    bust: 73,
    waist: 54,
    hips: 74,
    age: 14,
    blood_type: null,
    cup: null,
    ...overrides,
  } as CharacterDetail
}

describe('buildInfoRows', () => {
  it('drops labels whose value is already rendered from a structured field', () => {
    const labels = [
      { key: '生日', value: '7月4日' },
      { key: '身高', value: '144cm' },
      { key: '体重', value: '36kg' },
      { key: 'BWH', value: 'B73/W54/H74' },
      { key: '年龄', value: '14' },
      { key: '趣味', value: '読書' },
    ] as EntityLabel[]

    const rows = buildInfoRows('character', character(), labels)

    expect(rows.map(r => r.key)).toEqual(['性别', '生日', '身高', '体重', '三围', '年龄', '趣味'])
    expect(rows.filter(r => r.value === '144cm')).toHaveLength(1)
  })

  it('drops a label whose key is already rendered even when the value differs', () => {
    const labels = [
      { key: '年龄', value: '16岁' },
      { key: '身高', value: '152cm' },
    ] as EntityLabel[]

    const rows = buildInfoRows('character', character({ age: 16, height: 152 }), labels)

    expect(rows.filter(r => r.key === '年龄')).toHaveLength(1)
    expect(rows.find(r => r.key === '年龄')?.value).toBe('16')
    expect(rows.filter(r => r.key === '身高')).toHaveLength(1)
  })

  it('keeps a label when the structured field is empty', () => {
    const labels = [{ key: '血型', value: 'O型' }] as EntityLabel[]

    const rows = buildInfoRows('character', character({ height: null }), labels)

    expect(rows.map(r => r.key)).toContain('血型')
    expect(rows.map(r => r.key)).not.toContain('身高')
  })

  it('matches values that differ only by separators or case', () => {
    const labels = [
      { key: 'BWH', value: 'b73 / w54 / h74' },
      { key: '身　高', value: '144 cm' },
    ] as EntityLabel[]

    const rows = buildInfoRows('character', character(), labels)

    expect(rows).toHaveLength(6)
  })
})
