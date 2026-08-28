import type { H3Event } from 'h3'
import QRCode from 'qrcode'
import { fetchBackendData } from '../../utils/backend-api'
import { definePageBffHandler } from '../../utils/page-bff'

type AppRelease = Awaited<ReturnType<typeof fetchRelease>>

function fetchRelease(event: H3Event) {
  return fetchBackendData(event, '/api/v3/site/app-release')
}

async function androidQrCode(release: AppRelease) {
  const target = release.android?.find(item => item.abi === 'arm64-v8a') ?? release.android?.[0]
  if (!release.available || !target) return null

  return QRCode.toDataURL(target.url, {
    margin: 1,
    width: 320,
    errorCorrectionLevel: 'H',
    color: { dark: '#0f172a', light: '#ffffff' },
  }).catch(() => null)
}

async function handler(event: H3Event) {
  const release = await fetchRelease(event)

  return { release, android_qr: await androidQrCode(release) }
}

export type AppPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
