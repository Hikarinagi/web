import { isRecord } from '#shared/utils/record'
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
  nsfw?: boolean | null
  sexual?: number | null
  violence?: number | null
}

export interface HikariImageRelationSource {
  media?: HikariImageMediaSource | null
  nsfw?: boolean | null
  sexual?: number | null
  violence?: number | null
}

export type HikariImageSource =
  | string
  | HikariImageMediaSource
  | HikariImageRelationSource
  | null
  | undefined

export interface HikariImageSafety {
  nsfw: boolean
  sexual: number
  violence: number
}

export function imageSourceSrc(source: HikariImageSource): string | null | undefined {
  if (typeof source === 'string' || source == null) return source

  return readSrc(readMedia(source)) ?? readSrc(source)
}

export function imageSourceSafety(source: HikariImageSource): HikariImageSafety {
  if (typeof source === 'string' || source == null) return { nsfw: false, sexual: 0, violence: 0 }
  const media = readMedia(source)

  return {
    nsfw: Boolean(readField(source, 'nsfw') || readField(media, 'nsfw')),
    sexual: Math.max(readScore(readField(source, 'sexual')), readScore(readField(media, 'sexual'))),
    violence: Math.max(
      readScore(readField(source, 'violence')),
      readScore(readField(media, 'violence')),
    ),
  }
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
