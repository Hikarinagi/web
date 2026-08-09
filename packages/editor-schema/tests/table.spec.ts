/**
 * @jest-environment jsdom
 */
import { generateHTML } from '@tiptap/core'
import {
  ARTICLE_PRESET,
  COMMENT_PRESET,
  POST_PRESET,
  TABLE_EXTENSIONS,
  TableCellExtension,
  TableExtension,
  TableHeaderExtension,
  TableRowExtension,
  validateDocument,
} from '../src/index'

function doc(content: object[]): object {
  return { type: 'doc', content }
}

function cell(text: string, attrs: object = {}): object {
  return {
    type: 'table_cell',
    attrs,
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
  }
}

function header(text: string, attrs: object = {}): object {
  return {
    type: 'table_header',
    attrs,
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
  }
}

function table(rows: object[][]): object {
  return {
    type: 'table',
    content: rows.map(cells => ({ type: 'table_row', content: cells })),
  }
}

const validTable = table([
  [header('作品'), header('发售年')],
  [cell('Fate/stay night'), cell('2004')],
])

describe('table node schema', () => {
  it('节点名是 snake_case 且保留 prosemirror-tables 的 tableRole', () => {
    expect(TableExtension.name).toBe('table')
    expect(TableRowExtension.name).toBe('table_row')
    expect(TableHeaderExtension.name).toBe('table_header')
    expect(TableCellExtension.name).toBe('table_cell')
    expect(TableExtension.config.tableRole).toBe('table')
    expect(TableRowExtension.config.tableRole).toBe('row')
    expect(TableHeaderExtension.config.tableRole).toBe('header_cell')
    expect(TableCellExtension.config.tableRole).toBe('cell')
  })

  it('content 表达式引用 snake_case 节点名，单元格只收 paragraph', () => {
    expect(TableExtension.config.content).toBe('table_row+')
    expect(TableRowExtension.config.content).toBe('(table_cell | table_header)*')
    expect(TableHeaderExtension.config.content).toBe('paragraph+')
    expect(TableCellExtension.config.content).toBe('paragraph+')
  })

  it('渲染成 table / tr / th / td', () => {
    const html = generateHTML(
      doc([validTable]) as Parameters<typeof generateHTML>[0],
      ARTICLE_PRESET.extensions,
    )
    expect(html).toContain('<table')
    expect(html).toContain('<tbody>')
    expect(html).toContain('<tr>')
    expect(html).toContain('<th')
    expect(html).toContain('<td')
    expect(html).toContain('Fate/stay night')
  })
})

describe('table preset gating', () => {
  it('article preset 放行表格，且 table 可作为顶层节点', () => {
    for (const type of ['table', 'table_row', 'table_header', 'table_cell']) {
      expect(ARTICLE_PRESET.allowed_node_types.has(type)).toBe(true)
    }
    expect(ARTICLE_PRESET.allowed_top_level_nodes.has('table')).toBe(true)
    expect(ARTICLE_PRESET.extensions).toEqual(expect.arrayContaining(TABLE_EXTENSIONS))
  })

  it('post / comment preset 不放行表格', () => {
    for (const preset of [POST_PRESET, COMMENT_PRESET]) {
      expect(preset.allowed_node_types.has('table')).toBe(false)
      expect(preset.allowed_top_level_nodes.has('table')).toBe(false)
      expect(preset.limits.max_table_nodes).toBe(0)
    }
    expect(validateDocument(doc([validTable]), POST_PRESET).ok).toBe(false)
  })
})

describe('table validation', () => {
  it('合法表格通过 article preset', () => {
    expect(validateDocument(doc([validTable]), ARTICLE_PRESET).ok).toBe(true)
  })

  it('合法 colspan / rowspan / colwidth / align 通过', () => {
    const d = doc([
      table([[cell('a', { colspan: 2, rowspan: 1, colwidth: [120, 80], align: 'center' })]]),
    ])
    expect(validateDocument(d, ARTICLE_PRESET).ok).toBe(true)
  })

  it('colspan 非正整数时拒绝', () => {
    const r = validateDocument(doc([table([[cell('a', { colspan: 0 })]])]), ARTICLE_PRESET)
    expect(r.ok).toBe(false)
    expect(r.issues.find(i => i.code === 'invalid_attr_type')?.path).toContain('colspan')
  })

  it('colwidth 非正整数数组时拒绝', () => {
    const r = validateDocument(doc([table([[cell('a', { colwidth: 120 })]])]), ARTICLE_PRESET)
    expect(r.ok).toBe(false)
    expect(r.issues.find(i => i.code === 'invalid_attr_type')?.path).toContain('colwidth')
  })

  it('align 取值超出 left / center / right 时拒绝', () => {
    const r = validateDocument(doc([table([[cell('a', { align: 'justify' })]])]), ARTICLE_PRESET)
    expect(r.ok).toBe(false)
    expect(r.issues.find(i => i.code === 'invalid_attr_type')?.path).toContain('align')
  })

  it('table 直接挂非 table_row 子节点时拒绝', () => {
    const d = doc([{ type: 'table', content: [{ type: 'paragraph' }] }])
    const r = validateDocument(d, ARTICLE_PRESET)
    expect(r.ok).toBe(false)
    expect(r.issues.find(i => i.code === 'invalid_node_child')).toBeDefined()
  })

  it('table_row 挂非单元格子节点时拒绝', () => {
    const d = doc([
      { type: 'table', content: [{ type: 'table_row', content: [{ type: 'paragraph' }] }] },
    ])
    const r = validateDocument(d, ARTICLE_PRESET)
    expect(r.ok).toBe(false)
    expect(r.issues.find(i => i.code === 'invalid_node_child')).toBeDefined()
  })

  it('单元格内嵌套表格时拒绝', () => {
    const d = doc([
      {
        type: 'table',
        content: [
          {
            type: 'table_row',
            content: [{ type: 'table_cell', content: [validTable] }],
          },
        ],
      },
    ])
    const r = validateDocument(d, ARTICLE_PRESET)
    expect(r.ok).toBe(false)
    expect(r.issues.find(i => i.code === 'invalid_node_child')).toBeDefined()
  })

  it('表格数量超过上限时拒绝', () => {
    const tables = Array.from(
      { length: ARTICLE_PRESET.limits.max_table_nodes + 1 },
      () => validTable,
    )
    const r = validateDocument(doc(tables), ARTICLE_PRESET)
    expect(r.ok).toBe(false)
    expect(r.issues.find(i => i.code === 'limit_exceeded_table_nodes')).toBeDefined()
  })
})
