import { TABLE_CELL_MIN_WIDTH, type EditorNode } from '@hikarinagi/editor-schema'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Dispatch from '../../../app/components/hikari-content/Dispatch.vue'
import Paragraph from '../../../app/components/hikari-content/nodes/Paragraph.vue'
import Text from '../../../app/components/hikari-content/nodes/Text.vue'
import Block from '../../../app/components/hikari-content/nodes/table/Block.vue'
import Cell from '../../../app/components/hikari-content/nodes/table/Cell.vue'
import Row from '../../../app/components/hikari-content/nodes/table/Row.vue'

const components = {
  HikariContentDispatch: Dispatch,
  HikariContentNodesParagraph: Paragraph,
  HikariContentNodesText: Text,
  HikariContentNodesTableBlock: Block,
  HikariContentNodesTableRow: Row,
  HikariContentNodesTableCell: Cell,
}

function cell(
  type: 'table_cell' | 'table_header',
  text: string,
  attrs: Record<string, unknown> = {},
): EditorNode {
  return {
    type,
    attrs,
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
  }
}

function row(cells: EditorNode[]): EditorNode {
  return { type: 'table_row', content: cells }
}

function warnHandler(msg: string) {
  if (!msg.startsWith('Failed to resolve component')) throw new Error(msg)
}

function render(node: EditorNode) {
  return mount(Dispatch, { props: { node }, global: { components, config: { warnHandler } } })
}

describe('hikari-content table', () => {
  it('把 table_header 渲染成 th、table_cell 渲染成 td，并包在可横向滚动的容器里', () => {
    const wrapper = render({
      type: 'table',
      content: [
        row([cell('table_header', '作品'), cell('table_header', '发售年')]),
        row([cell('table_cell', 'GINKA'), cell('table_cell', '2024')]),
      ],
    })

    expect(wrapper.find('.hikari-table-scroll table tbody').exists()).toBe(true)
    expect(wrapper.findAll('.hikari-table-scroll tr')).toHaveLength(2)
    expect(wrapper.findAll('.hikari-table-scroll th').map(th => th.text())).toEqual([
      '作品',
      '发售年',
    ])
    expect(wrapper.findAll('.hikari-table-scroll td').map(td => td.text())).toEqual([
      'GINKA',
      '2024',
    ])
  })

  it('有表头行时额外渲染一份只含首行的副本，供页面级 sticky 用', () => {
    const wrapper = render({
      type: 'table',
      content: [
        row([cell('table_header', '作品'), cell('table_header', '发售年')]),
        row([cell('table_cell', 'GINKA'), cell('table_cell', '2024')]),
      ],
    })

    const ghost = wrapper.get('.hikari-table-sticky')
    expect(ghost.attributes('aria-hidden')).toBe('true')
    expect(ghost.findAll('tr')).toHaveLength(1)
    expect(ghost.findAll('th').map(th => th.text())).toEqual(['作品', '发售年'])
    expect(ghost.findAll('col')).toHaveLength(2)
  })

  it('没有表头行就不渲染副本', () => {
    const wrapper = render({
      type: 'table',
      content: [row([cell('table_cell', 'A'), cell('table_cell', 'B')])],
    })

    expect(wrapper.find('.hikari-table-sticky').exists()).toBe(false)
  })

  it('colspan / rowspan 只在大于 1 时落到 DOM', () => {
    const wrapper = render({
      type: 'table',
      content: [row([cell('table_cell', '合并', { colspan: 2, rowspan: 1 })])],
    })

    const td = wrapper.get('td')
    expect(td.attributes('colspan')).toBe('2')
    expect(td.attributes('rowspan')).toBeUndefined()
  })

  it('align 落成 text-align，非法取值被丢弃', () => {
    const wrapper = render({
      type: 'table',
      content: [
        row([
          cell('table_cell', '居中', { align: 'center' }),
          cell('table_cell', '非法', { align: 'justify' }),
        ]),
      ],
    })

    const cells = wrapper.findAll('td')
    expect(cells[0]!.attributes('style')).toContain('text-align: center')
    expect(cells[1]!.attributes('style')).toBeUndefined()
  })

  it('首行 colwidth 落到 colgroup，没存过宽度的列退到共享最小列宽', () => {
    const wrapper = render({
      type: 'table',
      content: [
        row([
          cell('table_cell', 'A', { colwidth: [160] }),
          cell('table_cell', 'B', { colwidth: null }),
        ]),
      ],
    })

    const cols = wrapper.findAll('col')
    expect(cols).toHaveLength(2)
    expect(cols[0]!.attributes('style')).toContain('width: 160px')
    expect(cols[1]!.attributes('style')).toContain(`min-width: ${TABLE_CELL_MIN_WIDTH}px`)
    expect(wrapper.get('table').attributes('style')).toContain(
      `min-width: ${160 + TABLE_CELL_MIN_WIDTH}px`,
    )
  })

  it('没有 colwidth 时 colgroup 照样渲染，整表按最小列宽撑开', () => {
    const wrapper = render({
      type: 'table',
      content: [row([cell('table_cell', 'A'), cell('table_cell', 'B')])],
    })

    expect(wrapper.findAll('col')).toHaveLength(2)
    expect(wrapper.get('table').attributes('style')).toContain(
      `min-width: ${TABLE_CELL_MIN_WIDTH * 2}px`,
    )
  })

  it('首行全是 table_header 才算表头行，首列同理', () => {
    const withHeaders = render({
      type: 'table',
      content: [
        row([cell('table_header', 'A'), cell('table_header', 'B')]),
        row([cell('table_header', 'C'), cell('table_cell', 'D')]),
      ],
    })
    expect(withHeaders.get('.tableWrapper').classes()).toContain('has-header-row')
    expect(withHeaders.get('.tableWrapper').classes()).toContain('has-header-column')

    const plain = render({
      type: 'table',
      content: [row([cell('table_header', 'A'), cell('table_cell', 'B')])],
    })
    expect(plain.get('.tableWrapper').classes()).not.toContain('has-header-row')
    expect(plain.get('.tableWrapper').classes()).toContain('has-header-column')
  })

  it('丢弃 table / table_row 下混入的非法子节点', () => {
    const wrapper = render({
      type: 'table',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: '脏数据' }] },
        row([cell('table_cell', 'A'), { type: 'paragraph' }]),
      ],
    })

    expect(wrapper.findAll('tr')).toHaveLength(1)
    expect(wrapper.findAll('td')).toHaveLength(1)
    expect(wrapper.text()).not.toContain('脏数据')
  })
})
