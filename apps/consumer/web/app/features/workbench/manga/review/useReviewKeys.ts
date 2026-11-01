import type { ReviewState } from './useReviewState'

export function useReviewKeys(
  state: ReviewState,
  actions: {
    note: () => void
    drawing: () => boolean
    stop: () => void
    enabled: () => boolean
  },
) {
  onKeyStroke(event => {
    if (!actions.enabled() || event.ctrlKey || event.metaKey || event.altKey) return
    const target = event.target instanceof HTMLElement ? event.target : null
    if (
      target &&
      (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
    ) {
      return
    }
    const composite = !!target?.closest('[role="toolbar"],[role="radiogroup"],[role="slider"]')
    const page = state.view.value === 'page'
    const compare = page && state.replacement.value
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
    const actionsByKey: Record<string, (() => void) | undefined> = {
      g: () => (state.view.value = 'overview'),
      e: () => state.open(state.index.value),
      ArrowLeft: page && !composite ? () => state.step(-1) : undefined,
      ArrowRight: page && !composite ? () => state.step(1) : undefined,
      1: compare ? () => (state.mode.value = 'side') : undefined,
      2: compare ? () => (state.mode.value = 'swipe') : undefined,
      3: compare ? () => (state.mode.value = 'toggle') : undefined,
      ' ':
        compare && state.mode.value === 'toggle' && !composite
          ? () => (state.showing.value = state.showing.value === 'upload' ? 'baseline' : 'upload')
          : undefined,
      n: page ? actions.note : undefined,
      Escape: actions.drawing() ? actions.stop : undefined,
      0: page ? () => (state.zoom.value = 'fit') : undefined,
      '+': page ? () => state.zoomBy(1) : undefined,
      '=': page ? () => state.zoomBy(1) : undefined,
      '-': page ? () => state.zoomBy(-1) : undefined,
    }
    const run = actionsByKey[key]
    if (!run) return
    event.preventDefault()
    run()
  })
}
