import type { H3Event } from 'h3'
import { fetchBackendData } from '../../utils/backend-api'
import { definePageBffHandler } from '../../utils/page-bff'

type AppRelease = Awaited<ReturnType<typeof fetchRelease>>

function fetchRelease(event: H3Event) {
  return fetchBackendData(event, '/api/v3/site/app-release')
}

function androidUrl(release: AppRelease): string | null {
  const target = release.android?.find(item => item.abi === 'arm64-v8a') ?? release.android?.[0]
  if (!release.available || !target) return null
  return target.url
}

async function handler(event: H3Event) {
  const release = await fetchRelease(event)

  return { release, android_url: androidUrl(release) }
}

export type AppPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
