import { getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../utils/page-bff'
import { steamApps } from '../../../../utils/steam'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const galgame = await fetchBackendData(event, '/api/v3/galgames/{id}', { path: { id } })

  return { apps: await steamApps(galgame.steam_apps.map(app => app.app_id)) }
}

export type GalgameSteamData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler, {
  cache: { header: 'public, max-age=0, s-maxage=21600' },
})
