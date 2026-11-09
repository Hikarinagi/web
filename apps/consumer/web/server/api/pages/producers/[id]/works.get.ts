import { getQuery, getRouterParam, type H3Event } from 'h3'
import { readOrgQuery } from '~/features/org/results'
import type { OrgMode } from '~/features/org/works'
import { fetchOrgList } from '../../../../utils/org-list'
import { definePageBffHandler } from '../../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const query = getQuery(event)
  const modes: OrgMode[] = ['history', 'shelf', 'hub', 'serials']
  const mode = modes.find(item => item === query.mode) ?? 'history'
  const state = readOrgQuery(query)
  return { list: await fetchOrgList(event, id, mode, state), state }
}

export type ProducerListData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
