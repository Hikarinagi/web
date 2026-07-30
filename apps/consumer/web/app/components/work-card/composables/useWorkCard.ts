import type { ApiData } from '@hikarinagi/api-contract/v3'
import type { WorkType } from '#shared/utils/work'
import { createHoverCard } from '~/components/hover-card/composables/useHoverCard'

export type WorkCardData = ApiData<'/api/v3/galgames/{id}/card', 'get'>

function fetchWork(workType: WorkType, id: number): Promise<WorkCardData> {
  if (workType === 'GALGAME')
    return hikariRequest<'/api/v3/galgames/{id}/card'>('/api/v3/galgames/{id}/card', {
      path: { id },
      toast: false,
      method: 'get',
    })
  if (workType === 'MANGA')
    return hikariRequest<'/api/v3/mangas/{id}/card'>('/api/v3/mangas/{id}/card', {
      path: { id },
      toast: false,
      method: 'get',
    })
  return hikariRequest<'/api/v3/light-novels/{id}/card'>('/api/v3/light-novels/{id}/card', {
    path: { id },
    toast: false,
    method: 'get',
  })
}

const controller = createHoverCard<WorkCardData>()

export function useWorkCard() {
  const card = controller()
  return {
    ...card,
    requestShow: (workType: WorkType, id: number, anchor: HTMLElement) =>
      card.requestShow({ key: `${workType}:${id}`, anchor, load: () => fetchWork(workType, id) }),
    showNow: (workType: WorkType, id: number, anchor: HTMLElement) =>
      card.showNow({ key: `${workType}:${id}`, anchor, load: () => fetchWork(workType, id) }),
  }
}
