export interface JustifiedCell<T> {
  item: T
  width: number
  height: number
}

interface JustifiedOptions {
  targetHeight?: number
  gap?: number
  maxRowHeightFactor?: number
}

export function justifiedRows<T>(
  items: { item: T; ratio: number }[],
  containerWidth: number,
  options: JustifiedOptions = {},
): JustifiedCell<T>[][] {
  const targetHeight = options.targetHeight ?? 200
  const gap = options.gap ?? 8
  const maxRowHeightFactor = options.maxRowHeightFactor ?? 1.5
  if (containerWidth <= 0 || !items.length) return []

  const rows: JustifiedCell<T>[][] = []
  let current: { item: T; ratio: number }[] = []
  let ratioSum = 0

  const flush = (isLast: boolean) => {
    if (!current.length) return
    const fitHeight = (containerWidth - gap * (current.length - 1)) / ratioSum
    const height =
      isLast && fitHeight > targetHeight * maxRowHeightFactor ? targetHeight : fitHeight
    rows.push(current.map(({ item, ratio }) => ({ item, width: ratio * height, height })))
    current = []
    ratioSum = 0
  }

  for (const entry of items) {
    current.push(entry)
    ratioSum += entry.ratio
    if (targetHeight * ratioSum + gap * (current.length - 1) >= containerWidth) flush(false)
  }
  flush(true)
  return rows
}
