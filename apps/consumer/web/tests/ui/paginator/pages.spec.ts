import { describe, expect, it } from 'vitest'
import { clampPage, totalPagesFor, totalPagesOf } from '../../../app/components/ui/paginator/pages'
import type { PageMeta } from '../../../app/components/ui/paginator/types'

const meta = (over: Partial<PageMeta> = {}): PageMeta =>
  ({ page: 1, page_size: 20, total_items: 95, total_pages: 5, ...over }) as PageMeta

describe('totalPagesOf', () => {
  it('用后端给的 total_pages，不自己重算', () => {
    expect(totalPagesOf(meta({ total_items: 95, total_pages: 5 }))).toBe(5)
  })

  it('页长和后端那次分页不一致时才自己算', () => {
    expect(totalPagesOf(meta({ total_items: 95, total_pages: 5 }), 10)).toBe(10)
  })

  it('空列表也至少有一页，分页器不会渲染成零页', () => {
    expect(totalPagesOf(meta({ total_items: 0, total_pages: 0 }))).toBe(1)
  })

  it('后端给了非有限值时退回一页', () => {
    expect(totalPagesOf(meta({ total_pages: Number.NaN }))).toBe(1)
  })
})

describe('totalPagesFor', () => {
  it('除不尽时向上取整', () => {
    expect(totalPagesFor(95, 20)).toBe(5)
    expect(totalPagesFor(100, 20)).toBe(5)
    expect(totalPagesFor(101, 20)).toBe(6)
  })

  it('页长为零不会除出 Infinity', () => {
    expect(totalPagesFor(95, 0)).toBe(95)
  })

  it('没有条目也算一页', () => {
    expect(totalPagesFor(0, 20)).toBe(1)
  })
})

describe('clampPage', () => {
  it('把越界的页码夹回范围内', () => {
    expect(clampPage(0, 5)).toBe(1)
    expect(clampPage(-3, 5)).toBe(1)
    expect(clampPage(99, 5)).toBe(5)
  })

  it('URL 里的小数和非法值都落回第一页', () => {
    expect(clampPage(2.7, 5)).toBe(2)
    expect(clampPage(Number.NaN, 5)).toBe(1)
  })

  it('总页数为零时仍然停在第一页', () => {
    expect(clampPage(3, 0)).toBe(1)
  })
})
