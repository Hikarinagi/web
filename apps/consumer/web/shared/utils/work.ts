export type WorkType = 'GALGAME' | 'LIGHT_NOVEL' | 'MANGA'

export function workPath(workType: WorkType, id: number): string {
  if (workType === 'GALGAME') return `/galgames/${id}`
  if (workType === 'MANGA') return `/mangas/${id}`
  return `/light-novels/${id}`
}

export function workTypeLabel(workType: WorkType): string {
  if (workType === 'GALGAME') return 'Galgame'
  if (workType === 'MANGA') return '漫画'
  return '轻小说'
}
