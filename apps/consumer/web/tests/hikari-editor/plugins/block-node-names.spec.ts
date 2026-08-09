import { describe, expect, it } from 'vitest'
import { blockquote } from '../../../app/components/hikari-editor/plugins/blockquote'
import { bulletList } from '../../../app/components/hikari-editor/plugins/bullet-list'
import { codeBlock } from '../../../app/components/hikari-editor/plugins/code-block'
import { horizontalRule } from '../../../app/components/hikari-editor/plugins/horizontal-rule'
import { orderedList } from '../../../app/components/hikari-editor/plugins/ordered-list'
import { table } from '../../../app/components/hikari-editor/plugins/table'
import type {
  EditorPlugin,
  EditorPluginContext,
} from '../../../app/components/hikari-editor/plugins/types'

// 节点名必须是 snake_case,才能对上存储 / 流水线校验(allowed_node_types)/ hikari-content 渲染分发。
// Tiptap 内置节点默认是 camelCase(bulletList / horizontalRule …),不改名就会保存被拦 + 渲染不出。
const SNAKE_CASE = /^[a-z]+(_[a-z]+)*$/
const ctx = undefined as unknown as EditorPluginContext

function nodeNames(plugin: EditorPlugin): string[] {
  return (plugin.extensions?.(ctx) ?? []).map(ext => ext.name)
}

describe('block-format plugins emit snake_case node names', () => {
  it.each([
    ['bullet-list', bulletList, ['bullet_list', 'list_item']],
    ['ordered-list', orderedList, ['ordered_list', 'list_item']],
    ['code-block', codeBlock, ['code_block']],
    ['blockquote', blockquote, ['blockquote']],
    ['horizontal-rule', horizontalRule, ['horizontal_rule']],
    ['table', table, ['table', 'table_row', 'table_header', 'table_cell']],
  ] as const)('%s', (_id, plugin, expected) => {
    const names = nodeNames(plugin)
    expect(names).toEqual(expected)
    for (const name of names) expect(name).toMatch(SNAKE_CASE)
  })
})
