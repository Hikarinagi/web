type TextNode = { text?: string; content?: TextNode[] }

// 递归取节点纯文本(用于 heading 锚点 id / TOC 文案)。
export function nodeText(node: TextNode): string {
  if (node.text) return node.text
  return (node.content ?? []).map(nodeText).join('')
}

// 从标题文本生成稳定 slug;保留 unicode 字母/数字(含中文),空白转 -,其余符号丢弃。
export function headingSlug(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}
