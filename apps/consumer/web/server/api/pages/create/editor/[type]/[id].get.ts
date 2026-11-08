import type { BackendEditorRef } from '~/features/creator/editor'
import { getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '../../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../../utils/page-bff'

async function handler(event: H3Event) {
  const type = String(getRouterParam(event, 'type'))
  const id = Number(getRouterParam(event, 'id'))

  const schema = await fetchBackendData(event, '/api/v3/contribution/schemas/{resource_type}', {
    path: { resource_type: type },
  })
  const [snapshot, openList] = await Promise.all([
    fetchBackendData(event, '/api/v3/contribution/snapshots/{resource_type}/{id}', {
      path: { resource_type: type, id },
    }),
    fetchBackendData(event, '/api/v3/change-requests', {
      query: {
        resource_type: schema.resource_type,
        resource_id: id,
        status: 'PENDING',
        page: 1,
        page_size: 1,
      },
    }),
  ])

  const openId = openList.items[0]?.id ?? null

  return {
    schema,
    snapshot: snapshot.snapshot,
    refs: (snapshot.refs ?? {}) as Record<string, BackendEditorRef>,
    resource: snapshot.resource,
    open_change_request: openId
      ? await fetchBackendData(event, '/api/v3/change-requests/{id}', {
          path: { id: openId },
        })
      : null,
  }
}

export type CreatorEditorPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
