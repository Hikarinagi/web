export interface WorkCardTone {
  title: string
  subtitle: string
  meta: string
}

export function workCardTone(onImage: boolean): WorkCardTone {
  if (!onImage) {
    return {
      title: 'text-(--editor-text-color)',
      subtitle: 'text-(--editor-text-muted)',
      meta: 'text-(--editor-text-muted)',
    }
  }
  return {
    title: 'text-white text-shadow-hikari-on-image',
    subtitle: 'text-white/78 text-shadow-hikari-on-image',
    meta: 'text-white/65 text-shadow-hikari-on-image',
  }
}

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
