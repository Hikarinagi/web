const SETTLE_MS = 220

function cssTextOf(element: Element): string {
  const style = getComputedStyle(element)
  let out = ''
  for (let i = 0; i < style.length; i++) {
    const name = style[i]!
    out += `${name}:${style.getPropertyValue(name)};`
  }
  return out
}

function cloneWithComputedStyle(source: HTMLElement): HTMLElement {
  const clone = source.cloneNode(true) as HTMLElement
  const sources = [source, ...Array.from(source.getElementsByTagName('*'))]
  const targets = [clone, ...Array.from(clone.getElementsByTagName('*'))]
  sources.forEach((element, index) => {
    const target = targets[index]
    if (target instanceof HTMLElement) target.style.cssText = cssTextOf(element)
  })
  return clone
}

export interface DragPreview {
  height: number
  moveTo: (clientX: number, clientY: number) => void
  settleTo: (left: number, top: number) => Promise<void>
  destroy: () => void
}

export function createDragPreview(source: HTMLElement, grabX: number, grabY: number): DragPreview {
  const box = source.getBoundingClientRect()
  const clone = cloneWithComputedStyle(source)
  clone.style.margin = '0'

  const lift = document.createElement('div')
  lift.className = 'hikari-block-drag-preview__lift'
  lift.append(clone)

  const host = document.createElement('div')
  host.className = 'hikari-block-drag-preview'
  host.style.width = `${box.width}px`
  host.append(lift)
  document.body.append(host)

  const offsetX = grabX - box.left
  const offsetY = grabY - box.top

  const place = (left: number, top: number) => {
    host.style.transform = `translate3d(${Math.round(left)}px, ${Math.round(top)}px, 0)`
  }

  place(box.left, box.top)
  requestAnimationFrame(() => lift.classList.add('is-lifted'))

  return {
    height: box.height,
    moveTo: (clientX, clientY) => place(clientX - offsetX, clientY - offsetY),
    settleTo: (left, top) =>
      new Promise(resolve => {
        host.classList.add('is-settling')
        lift.classList.remove('is-lifted')
        place(left, top)
        const done = () => {
          host.removeEventListener('transitionend', done)
          resolve()
        }
        host.addEventListener('transitionend', done)
        setTimeout(done, SETTLE_MS + 60)
      }),
    destroy: () => host.remove(),
  }
}
