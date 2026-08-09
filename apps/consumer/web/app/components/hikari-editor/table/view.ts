import type { Node as PMNode } from '@tiptap/pm/model'
import type { EditorView, ViewMutationRecord } from '@tiptap/pm/view'
import {
  TableMap,
  TableView,
  addColumn,
  addRow,
  columnIsHeader,
  rowIsHeader,
} from '@tiptap/pm/tables'
import { OverlayScrollbars } from 'overlayscrollbars'

const EDGE_TOLERANCE_PX = 1
const SHADOW_EDGES = ['top', 'bottom', 'left', 'right'] as const

export class HikariTableView extends TableView {
  private scroller: HTMLElement
  private sentinel: HTMLElement
  private clip: HTMLElement
  private shadows = new Map<(typeof SHADOW_EDGES)[number], HTMLElement>()
  private ghost: HTMLTableElement | null = null
  private scrollbars: OverlayScrollbars | null = null
  private watcher: IntersectionObserver | null = null
  private resizer: ResizeObserver | null = null
  private viewport: HTMLElement | null = null

  constructor(
    node: PMNode,
    defaultCellMinWidth: number,
    private view: EditorView,
  ) {
    super(node, defaultCellMinWidth)

    this.sentinel = document.createElement('div')
    this.sentinel.className = 'hikari-table-sentinel'

    const sticky = document.createElement('div')
    sticky.className = 'hikari-table-sticky'
    sticky.setAttribute('aria-hidden', 'true')
    sticky.contentEditable = 'false'

    this.clip = document.createElement('div')
    this.clip.className = 'hikari-table-sticky__clip'
    sticky.appendChild(this.clip)

    this.scroller = document.createElement('div')
    this.scroller.className = 'hikari-table-scroll'
    this.scroller.appendChild(this.table)

    const shadows = document.createElement('div')
    shadows.className = 'hikari-table-shadows'
    shadows.setAttribute('aria-hidden', 'true')
    for (const edge of SHADOW_EDGES) {
      const el = document.createElement('div')
      el.className = `hikari-table-shadow is-${edge}`
      shadows.appendChild(el)
      this.shadows.set(edge, el)
    }

    this.dom.appendChild(this.sentinel)
    this.dom.appendChild(sticky)
    this.dom.appendChild(this.scroller)
    this.dom.appendChild(this.plusButton('column', '在右侧追加一列'))
    this.dom.appendChild(this.plusButton('row', '在下方追加一行'))

    this.scrollbars = OverlayScrollbars(this.scroller, {
      scrollbars: {
        theme: 'os-theme-hikari',
        visibility: 'auto',
        autoHide: 'leave',
        autoHideDelay: 400,
      },
      overflow: { x: 'scroll', y: 'scroll' },
    })
    this.viewport = (this.scrollbars.elements().viewport as HTMLElement) ?? null
    this.viewport?.addEventListener('scroll', this.onScroll, { passive: true })
    this.viewport?.style.setProperty('overscroll-behavior', 'contain')
    this.viewport?.insertBefore(shadows, this.viewport.firstChild)

    this.watcher = new IntersectionObserver(
      ([entry]) => this.dom.classList.toggle('is-pinned', entry?.isIntersecting === false),
      { threshold: 0 },
    )
    this.watcher.observe(this.sentinel)

    this.resizer = new ResizeObserver(() => {
      this.syncGhost()
      this.syncMetrics()
      this.onScroll()
    })
    if (this.viewport) this.resizer.observe(this.viewport)

    this.syncHeaders(node)
  }

  private onScroll = () => {
    const el = this.viewport
    if (!el) return

    if (this.ghost) this.ghost.style.marginLeft = `${-el.scrollLeft}px`

    const maxX = el.scrollWidth - el.clientWidth
    const maxY = el.scrollHeight - el.clientHeight
    const visible = {
      top: el.scrollTop > EDGE_TOLERANCE_PX,
      bottom: maxY > 0 && el.scrollTop < maxY - EDGE_TOLERANCE_PX,
      left: el.scrollLeft > EDGE_TOLERANCE_PX,
      right: maxX > 0 && el.scrollLeft < maxX - EDGE_TOLERANCE_PX,
    }
    for (const edge of SHADOW_EDGES) {
      this.shadows.get(edge)?.classList.toggle('is-visible', visible[edge])
    }
  }

  private syncMetrics() {
    const row = this.contentDOM.firstElementChild as HTMLElement | null
    const cell = row?.firstElementChild as HTMLElement | null
    const head = this.dom.classList.contains('has-header-row') ? (row?.offsetHeight ?? 0) : 0
    const side = this.dom.classList.contains('has-header-column') ? (cell?.offsetWidth ?? 0) : 0
    this.dom.style.setProperty('--hikari-table-head-h', `${head}px`)
    this.dom.style.setProperty('--hikari-table-head-w', `${side}px`)
    this.dom.style.setProperty('--hikari-table-vp-w', `${this.viewport?.clientWidth ?? 0}px`)
    this.dom.style.setProperty('--hikari-table-vp-h', `${this.viewport?.clientHeight ?? 0}px`)
  }

  private plusButton(axis: 'column' | 'row', label: string): HTMLElement {
    const el = document.createElement('div')
    el.className = `hikari-table-plus is-${axis}`
    el.setAttribute('role', 'button')
    el.setAttribute('aria-label', label)
    el.contentEditable = 'false'
    el.addEventListener('mousedown', event => {
      event.preventDefault()
      event.stopPropagation()
      this.append(axis)
    })
    return el
  }

  private append(axis: 'column' | 'row') {
    const pos = this.view.posAtDOM(this.table, 0)
    if (pos < 0) return
    const $pos = this.view.state.doc.resolve(pos)
    const map = TableMap.get(this.node)
    const rect = {
      map,
      table: this.node,
      tableStart: $pos.start($pos.depth),
      left: 0,
      top: 0,
      right: map.width,
      bottom: map.height,
    }
    const tr = this.view.state.tr
    if (axis === 'column') addColumn(tr, rect, map.width)
    else addRow(tr, rect, map.height)
    this.view.dispatch(tr)
  }

  private syncHeaders(node: PMNode) {
    const map = TableMap.get(node)
    this.dom.classList.toggle('has-header-row', map.height > 0 && rowIsHeader(map, node, 0))
    this.dom.classList.toggle('has-header-column', map.width > 0 && columnIsHeader(map, node, 0))
  }

  private syncGhost() {
    const row = this.contentDOM.firstElementChild
    if (!row || !this.dom.classList.contains('has-header-row')) {
      this.ghost?.remove()
      this.ghost = null
      return
    }

    const ghost = document.createElement('table')
    ghost.className = this.table.className
    ghost.style.cssText = this.table.style.cssText
    ghost.appendChild(this.colgroup.cloneNode(true))
    const body = document.createElement('tbody')
    body.appendChild(row.cloneNode(true))
    ghost.appendChild(body)

    this.ghost?.remove()
    this.clip.appendChild(ghost)
    this.ghost = ghost
    this.onScroll()
  }

  override update(node: PMNode): boolean {
    if (!super.update(node)) return false
    this.syncHeaders(node)
    this.syncGhost()
    this.syncMetrics()
    return true
  }

  override ignoreMutation(record: ViewMutationRecord): boolean {
    return !this.contentDOM.contains(record.target)
  }

  destroy() {
    this.viewport?.removeEventListener('scroll', this.onScroll)
    this.watcher?.disconnect()
    this.resizer?.disconnect()
    this.scrollbars?.destroy()
    this.watcher = null
    this.resizer = null
    this.scrollbars = null
    this.viewport = null
  }
}
