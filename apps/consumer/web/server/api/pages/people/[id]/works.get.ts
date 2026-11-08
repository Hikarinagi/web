import { getQuery, type H3Event } from 'h3'
import { readPersonQuery } from '~/features/person/results'
import { definePageBffHandler } from '../../../../utils/page-bff'
import { readId } from '../../../../utils/page-query'
import { fetchPersonList } from '../../../../utils/person-list'

async function handler(event: H3Event) {
  const id = readId(event)
  const state = readPersonQuery(getQuery(event))
  return { list: await fetchPersonList(event, id, state), state }
}

export type PersonListData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
