import { isRecord } from '#shared/utils/record'
import type { CurrentUser } from '~/types/auth'
export {
  HIKARI_IMAGE_PRESETS,
  isHttpUrl,
  joinUrl,
  buildProcessUrl,
  canProcessImage,
  resolveImageUrl,
} from '@hikarinagi/config'
export type {
  HikariImageFit,
  HikariImageFormat,
  HikariImageGravity,
  HikariImageProcessingOptions,
  HikariImagePresetName,
  HikariImageProcessing,
  HikariImageResolveOptions,
} from '@hikarinagi/config'

export interface HikariImageMediaSource {
  src?: string | null
  width?: number | null
  height?: number | null
  thumb_hash?: string | null
  nsfw?: boolean | null
  sexual?: number | null
  violence?: number | null
}

export interface HikariImageRelationSource {
  media?: HikariImageMediaSource | null
  sexual?: number | null
  violence?: number | null
}

export interface HikariImageSize {
  width: number
  height: number
}

export type HikariImageSource =
  string | HikariImageMediaSource | HikariImageRelationSource | null | undefined

export interface HikariImageSafety {
  unrated: boolean
  sexual: number
  violence: number
}

export const RATING_LABELS = {
  sexual: ['无', '轻度', '重度'],
  violence: ['无', '轻度', '重度'],
} as const

export type ContentLimit = CurrentUser['content_limit']

export type ContentLimits = Pick<
  CurrentUser,
  'sexual_1_limit' | 'sexual_2_limit' | 'violence_1_limit' | 'violence_2_limit'
>

export const CONTENT_LIMIT_ORDER = [
  'NEVER_SHOW_NSFW_CONTENT',
  'SHOW_WITH_SPOILER',
  'JUST_SHOW',
] as const satisfies readonly ContentLimit[]

export function strictestLimit(...limits: ContentLimit[]): ContentLimit {
  return CONTENT_LIMIT_ORDER[Math.min(...limits.map(limit => CONTENT_LIMIT_ORDER.indexOf(limit)))]!
}

export function imageLimit(safety: HikariImageSafety, limits: ContentLimits): ContentLimit {
  return strictestLimit(
    'JUST_SHOW',
    ...(safety.sexual >= 1 ? [limits.sexual_1_limit] : []),
    ...(safety.sexual >= 2 || safety.unrated ? [limits.sexual_2_limit] : []),
    ...(safety.violence >= 1 ? [limits.violence_1_limit] : []),
    ...(safety.violence >= 2 ? [limits.violence_2_limit] : []),
  )
}

export function imageSourceSrc(source: HikariImageSource): string | null | undefined {
  if (typeof source === 'string' || source == null) return source

  return readSrc(readMedia(source)) ?? readSrc(source)
}

export function imageSourceSafety(source: HikariImageSource): HikariImageSafety {
  if (typeof source === 'string' || source == null)
    return { unrated: false, sexual: 0, violence: 0 }
  const media = readMedia(source)

  return {
    unrated:
      readField(media ?? source, 'nsfw') === true ||
      [source, media].some(
        item => readField(item, 'sexual') === null || readField(item, 'violence') === null,
      ),
    sexual: Math.max(readScore(readField(source, 'sexual')), readScore(readField(media, 'sexual'))),
    violence: Math.max(
      readScore(readField(source, 'violence')),
      readScore(readField(media, 'violence')),
    ),
  }
}

export function imageSourceSize(source: HikariImageSource): HikariImageSize | undefined {
  if (typeof source === 'string' || source == null) return undefined

  const target = readMedia(source) ?? source
  const width = readSide(readField(target, 'width'))
  const height = readSide(readField(target, 'height'))
  return width && height ? { width, height } : undefined
}

export function imageSourceThumbHash(source: HikariImageSource): string | undefined {
  if (typeof source === 'string' || source == null) return undefined

  const hash = readField(readMedia(source) ?? source, 'thumb_hash')
  return typeof hash === 'string' && hash ? hash : undefined
}

function readSide(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0
}

function readMedia(source: HikariImageMediaSource | HikariImageRelationSource) {
  const media = readField(source, 'media')
  return isRecord(media) ? media : null
}

function readSrc(source: unknown): string | null | undefined {
  const src = readField(source, 'src')
  return typeof src === 'string' || src === null || src === undefined ? src : undefined
}

function readScore(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function readField(source: unknown, field: string) {
  return isRecord(source) ? source[field] : undefined
}

export function topVotedCover<TCover extends { votes?: number | null }>(
  covers: readonly TCover[] | null | undefined,
): TCover | null {
  let top: TCover | null = null
  for (const cover of covers ?? []) {
    if (!top || (cover.votes ?? 0) > (top.votes ?? 0)) top = cover
  }
  return top
}

export function topVotedMedia<TMedia>(
  covers: readonly { votes?: number | null; media?: TMedia | null }[] | null | undefined,
): TMedia | null {
  return topVotedCover(covers)?.media ?? null
}
