import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'
import { imageSourceSrc, topVotedMedia } from './image'

type GalgameDetail = GalgamePageData['galgame']
type GalgameCover = GalgameDetail['covers'][number]['media']
type GalgameImage = GalgameDetail['images'][number]

export function getGalgameCover(galgame: GalgameDetail): GalgameCover | null {
  return topVotedMedia(galgame.covers)
}

export function getGalgameCoverSrc(galgame: GalgameDetail) {
  return getGalgameCover(galgame)?.src || undefined
}

export function getGalgameBannerSource(galgame: GalgameDetail): GalgameImage | GalgameCover | null {
  const image = galgame.images[0]
  if (image) return image

  return getGalgameCover(galgame)
}

export function getGalgameBannerSrc(galgame: GalgameDetail) {
  return imageSourceSrc(getGalgameBannerSource(galgame)) || undefined
}
