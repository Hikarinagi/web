export interface RateCardTone {
  title: string
  byline: string
  excerpt: string
}

export function rateCardTone(onImage: boolean): RateCardTone {
  if (!onImage) {
    return {
      title: 'text-(--editor-text-color)',
      byline: 'text-(--editor-text-muted)',
      excerpt: 'text-(--editor-text-muted)',
    }
  }
  return {
    title: 'text-white text-shadow-hikari-on-image',
    byline: 'text-white/65 text-shadow-hikari-on-image',
    excerpt: 'text-white/80 text-shadow-hikari-on-image',
  }
}
