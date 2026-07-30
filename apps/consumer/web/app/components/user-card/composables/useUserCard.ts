import type { ApiData } from '@hikarinagi/api-contract/v3'
import { createHoverCard } from '~/components/hover-card/composables/useHoverCard'

export type UserCardData = ApiData<'/api/v3/user/{id}', 'get'>

function fetchUser(userId: number): Promise<UserCardData> {
  return hikariRequest<'/api/v3/user/{id}'>('/api/v3/user/{id}', {
    path: { id: userId },
    toast: false,
    method: 'get',
  })
}

const controller = createHoverCard<UserCardData>()

export function useUserCard() {
  const card = controller()
  return {
    ...card,
    requestShow: (userId: number, anchor: HTMLElement) =>
      card.requestShow({ key: String(userId), anchor, load: () => fetchUser(userId) }),
    showNow: (userId: number, anchor: HTMLElement) =>
      card.showNow({ key: String(userId), anchor, load: () => fetchUser(userId) }),
    invalidate: (userId: number, patch?: Partial<UserCardData>) =>
      card.invalidate(String(userId), patch),
  }
}
