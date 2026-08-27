import type { H3Event } from 'h3'
import QRCode from 'qrcode'
import { isRecord } from '#shared/utils/record'
import { definePageBffHandler } from '../../utils/page-bff'

export interface AppAndroidVariant {
  abi: string
  url: string
  size: number
  sha256: string
}

export interface AppIosBuild {
  signed: boolean
  url: string
  size: number
  sha256: string
}

export interface AppReleaseManifest {
  channel: string
  version: string
  build_number: string
  released_at: string
  commit: string
  android: AppAndroidVariant[]
  ios: AppIosBuild | null
}

const MANIFEST_TIMEOUT_MS = 5000

function toVariant(value: unknown): AppAndroidVariant | null {
  if (!isRecord(value)) return null
  const { abi, url, size, sha256 } = value
  if (typeof abi !== 'string' || typeof url !== 'string') return null

  return {
    abi,
    url,
    size: typeof size === 'number' ? size : 0,
    sha256: typeof sha256 === 'string' ? sha256 : '',
  }
}

function toIos(value: unknown): AppIosBuild | null {
  if (!isRecord(value)) return null
  const { url, size, sha256, signed } = value
  if (typeof url !== 'string') return null

  return {
    signed: signed === true,
    url,
    size: typeof size === 'number' ? size : 0,
    sha256: typeof sha256 === 'string' ? sha256 : '',
  }
}

function toManifest(value: unknown): AppReleaseManifest | null {
  if (!isRecord(value)) return null
  const { channel, version, build_number, released_at, commit, android, ios } = value
  if (typeof version !== 'string') return null

  const variants = Array.isArray(android)
    ? android.map(toVariant).filter((item): item is AppAndroidVariant => item !== null)
    : []
  const iosBuild = toIos(ios)
  if (!variants.length && !iosBuild) return null

  return {
    channel: typeof channel === 'string' ? channel : 'release',
    version,
    build_number: typeof build_number === 'string' ? build_number : '',
    released_at: typeof released_at === 'string' ? released_at : '',
    commit: typeof commit === 'string' ? commit : '',
    android: variants,
    ios: iosBuild,
  }
}

async function androidQrCode(manifest: AppReleaseManifest | null) {
  const target = manifest?.android.find(item => item.abi === 'arm64-v8a') ?? manifest?.android[0]
  if (!target) return null

  return QRCode.toDataURL(target.url, {
    margin: 1,
    width: 320,
    errorCorrectionLevel: 'M',
    color: { dark: '#0f172a', light: '#ffffff' },
  }).catch(() => null)
}

async function handler(
  _event: H3Event,
): Promise<{ manifest: AppReleaseManifest | null; android_qr: string | null }> {
  const url = useRuntimeConfig().appManifestUrl
  if (!url) return { manifest: null, android_qr: null }

  const payload = await $fetch<unknown>(url, {
    timeout: MANIFEST_TIMEOUT_MS,
    retry: 1,
  }).catch(() => null)

  const manifest = toManifest(payload)

  return { manifest, android_qr: await androidQrCode(manifest) }
}

export type AppPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler, {
  cache: { header: 'public, max-age=300, stale-while-revalidate=900' },
})
