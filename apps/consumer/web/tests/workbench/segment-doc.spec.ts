import { describe, expect, it } from 'vitest'
import {
  diffBlocks,
  docToBlocks,
  segmentsToDoc,
  type ChapterBlock,
  type SavedSegment,
} from '~/features/workbench/segment-doc'

const text = (id: string, value: string) =>
  ({ id, kind: 'TEXT', text: value, caption: null, image: null }) as const

const saved = (blocks: ChapterBlock[]) =>
  new Map<string, SavedSegment>(
    blocks.map((block, index) => [
      block.id,
      { ...block, sort_key: (index + 1) * 1024, version: 1 },
    ]),
  )

describe('segmentsToDoc / docToBlocks', () => {
  it('注音、着重号与换行在往返后保持原样', () => {
    const segments = [
      text('a', '｜賢狼《けんろう》ホロは《《笑った》》。\n二行目'),
      {
        id: 'b',
        kind: 'IMAGE',
        text: null,
        caption: '口絵',
        image: { id: 7, src: 'x.webp', width: 10, height: 20 },
      },
      { id: 'c', kind: 'BREAK', text: null, caption: null, image: null },
    ] as const
    const blocks = docToBlocks(segmentsToDoc(segments))
    expect(blocks).toEqual([
      {
        id: 'a',
        kind: 'TEXT',
        text: '｜賢狼《けんろう》ホロは《《笑った》》。\n二行目',
        image_id: null,
        caption: null,
      },
      { id: 'b', kind: 'IMAGE', text: null, image_id: 7, caption: '口絵' },
      { id: 'c', kind: 'BREAK', text: null, image_id: null, caption: null },
    ])
  })

  it('空段落与没有段落 id 的节点不产生段落', () => {
    const blocks = docToBlocks({
      type: 'doc',
      content: [
        { type: 'paragraph', attrs: { segment_id: 'a' } },
        { type: 'paragraph', content: [{ type: 'text', text: '无 id' }] },
        {
          type: 'paragraph',
          attrs: { segment_id: 'b' },
          content: [{ type: 'text', text: '正文' }],
        },
      ],
    })
    expect(blocks.map(block => block.id)).toEqual(['b'])
  })

  it('没有段落时给出一个空段落供输入', () => {
    expect(segmentsToDoc([])).toEqual({ type: 'doc', content: [{ type: 'paragraph' }] })
  })
})

describe('diffBlocks', () => {
  const base: ChapterBlock[] = ['a', 'b', 'c'].map(id => ({
    id,
    kind: 'TEXT',
    text: id,
    image_id: null,
    caption: null,
  }))

  it('没有变化时不提交任何操作', () => {
    expect(diffBlocks(base, saved(base))).toEqual({ upserts: [], deletes: [] })
  })

  it('中间插入的新段落取相邻两段排序键的中点，其余段落不动', () => {
    const inserted = { id: 'n', kind: 'TEXT' as const, text: '新', image_id: null, caption: null }
    const result = diffBlocks([base[0], inserted, base[1], base[2]], saved(base))
    expect(result.upserts).toEqual([{ ...inserted, sort_key: 1536 }])
    expect(result.deletes).toEqual([])
  })

  it('移到最前的段落重新取键，改过文字的段落带上版本号', () => {
    const edited = { ...base[1], text: 'b2' }
    const result = diffBlocks([base[2], base[0], edited], saved(base))
    expect(result.upserts).toEqual([
      { ...base[2], sort_key: 512, base_version: 1 },
      { ...edited, sort_key: 2048, base_version: 1 },
    ])
  })

  it('文档里消失的段落带版本号删除', () => {
    const result = diffBlocks([base[0], base[2]], saved(base))
    expect(result.deletes).toEqual([{ id: 'b', base_version: 1 }])
    expect(result.upserts).toEqual([])
  })
})
