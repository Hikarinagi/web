import { describe, expect, it } from 'vitest'
import { layoutMermaid } from '../../../app/features/mermaid/layout'
import { parseMermaid } from '../../../app/features/mermaid/parse'

describe('parseMermaid', () => {
  it('reads the direction from the header and normalizes it', () => {
    expect(parseMermaid('flowchart LR\nA-->B').direction).toBe('LR')
    expect(parseMermaid('graph TB\nA-->B').direction).toBe('TD')
    expect(parseMermaid('flowchart TD\nA-->B').direction).toBe('TD')
  })

  it('reads every supported node shape and falls back to the id as label', () => {
    const graph = parseMermaid(`flowchart LR
      A[方框] --> B(圆角)
      B --> C([胶囊])
      C --> D{菱形}
      D --> E`)

    expect(graph.nodes).toEqual([
      { id: 'A', label: '方框', shape: 'rect' },
      { id: 'B', label: '圆角', shape: 'round' },
      { id: 'C', label: '胶囊', shape: 'stadium' },
      { id: 'D', label: '菱形', shape: 'diamond' },
      { id: 'E', label: 'E', shape: 'rect' },
    ])
  })

  it('expands a chain into consecutive edges', () => {
    const graph = parseMermaid('flowchart LR\nA --> B --> C')
    expect(graph.edges.map(edge => [edge.from, edge.to])).toEqual([
      ['A', 'B'],
      ['B', 'C'],
    ])
  })

  it('reads edge labels, dashed links and arrowless links', () => {
    const graph = parseMermaid(`flowchart LR
      A -->|走这边| B
      A -.-> C
      A --- D`)

    expect(graph.edges).toEqual([
      { from: 'A', to: 'B', label: '走这边', dashed: false, arrow: true },
      { from: 'A', to: 'C', dashed: true, arrow: true },
      { from: 'A', to: 'D', dashed: false, arrow: false },
    ])
  })

  it('keeps a label declared on any occurrence of the node', () => {
    const graph = parseMermaid('flowchart LR\nA --> B\nB[后面才命名] --> C')
    expect(graph.nodes.find(node => node.id === 'B')?.label).toBe('后面才命名')
  })

  it('reads the ::: class assignment as a node variant', () => {
    const graph = parseMermaid('flowchart LR\nA[起点] --> B[分支]:::user --> C:::app')
    expect(graph.nodes.map(node => node.variant)).toEqual([undefined, 'user', 'app'])
  })

  it('ignores comments and blank lines', () => {
    const graph = parseMermaid(`flowchart LR
      %% 这行是注释
      A --> B %% 尾部注释
    `)
    expect(graph.nodes).toHaveLength(2)
    expect(graph.edges).toHaveLength(1)
  })
})

describe('layoutMermaid', () => {
  const fork = `flowchart LR
    A[创建应用] --> B{接入哪类数据}
    B -->|公开数据| C[换取应用级令牌] --> D[调用 open 端点]
    B -->|用户数据| E[配置回调地址] --> F[引导用户授权]`

  it('places each rank further along the main axis', () => {
    const layout = layoutMermaid(parseMermaid(fork))
    const at = (id: string) => layout.nodes.find(node => node.id === id)!

    expect(at('A').x).toBeLessThan(at('B').x)
    expect(at('B').x).toBeLessThan(at('C').x)
    expect(at('C').x).toBeLessThan(at('D').x)

    const center = (id: string) => at(id).x + at(id).width / 2
    expect(center('C')).toBe(center('E'))
  })

  it('separates the two branches on the cross axis', () => {
    const layout = layoutMermaid(parseMermaid(fork))
    const at = (id: string) => layout.nodes.find(node => node.id === id)!

    expect(at('C').y).not.toBe(at('E').y)
    expect(Math.abs(at('C').y - at('E').y)).toBeGreaterThanOrEqual(at('C').height)
  })

  it('keeps every node inside the reported canvas', () => {
    const layout = layoutMermaid(parseMermaid(fork))
    for (const node of layout.nodes) {
      expect(node.x).toBeGreaterThanOrEqual(0)
      expect(node.y).toBeGreaterThanOrEqual(0)
      expect(node.x + node.width).toBeLessThanOrEqual(layout.width)
      expect(node.y + node.height).toBeLessThanOrEqual(layout.height)
    }
  })

  it('emits one path per edge and carries the edge label through', () => {
    const layout = layoutMermaid(parseMermaid(fork))
    expect(layout.edges).toHaveLength(5)
    expect(layout.edges.every(edge => edge.d.startsWith('M'))).toBe(true)
    expect(layout.edges.filter(edge => edge.label).map(edge => edge.label)).toEqual([
      '公开数据',
      '用户数据',
    ])
  })

  it('keeps a branch in its own lane instead of recentering it when it is alone in a rank', () => {
    const layout = layoutMermaid(
      parseMermaid(`flowchart LR
        A --> B{分叉}
        B --> C[上路] --> D[上路终点]
        B --> E[下路] --> F[下路中段] --> G[下路终点]`),
    )
    const at = (id: string) => layout.nodes.find(node => node.id === id)!

    expect(at('E').y).toBe(at('F').y)
    expect(at('F').y).toBe(at('G').y)
    expect(at('C').y).toBe(at('D').y)
    expect(at('C').y).not.toBe(at('E').y)
  })

  it('colors an edge after the node it points at', () => {
    const layout = layoutMermaid(
      parseMermaid('flowchart LR\nA --> B[一]:::app\nA --> C[二]:::user'),
    )
    expect(layout.edges.map(edge => edge.variant)).toEqual(['app', 'user'])
  })

  it('lays a TD graph out downwards instead', () => {
    const layout = layoutMermaid(parseMermaid('flowchart TD\nA[一] --> B[二]'))
    const at = (id: string) => layout.nodes.find(node => node.id === id)!
    expect(at('A').y).toBeLessThan(at('B').y)
    expect(at('A').x).toBe(at('B').x)
  })

  it('sizes nodes from the label, counting CJK as full width', () => {
    const layout = layoutMermaid(
      parseMermaid('flowchart LR\nA[短] --> B[这是一个相当长的节点标签]'),
    )
    const at = (id: string) => layout.nodes.find(node => node.id === id)!
    expect(at('B').width).toBeGreaterThan(at('A').width)
  })
})
