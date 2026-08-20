import { getRouterParam, type H3Event } from 'h3'
import { fetchShell, fetchTab, readTab } from '~/features/space/server/page-bff'
import { definePageBffHandler } from '../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const shell = await fetchShell(event, id)
  const tab = await fetchTab(event, id, readTab(event))

  return {
    ...shell,
    ...tab,
  }
}

export type SpacePageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
