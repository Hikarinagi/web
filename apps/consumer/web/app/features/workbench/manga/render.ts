import { boundsOf, type Point } from './geometry'
import type { BackendMangaRegion } from './manga'
import { TYPESET_FONTS, fitLayout, readStyle, type TypesetStyle } from './typeset'

export interface TypesetRegion {
  vertices: Point[]
  x: number
  y: number
  text: string
  style: TypesetStyle
}

export function typesetRegions(
  regions: BackendMangaRegion[],
  mode: 'UPLOAD' | 'TRANSLATION',
): TypesetRegion[] {
  return regions.map(region => {
    const chosen = region.translations.find(row => row.selected)
    const vertices = region.vertices as Point[]
    const bounds = boundsOf(vertices, region.x, region.y)
    return {
      vertices,
      x: region.x,
      y: region.y,
      text:
        mode === 'TRANSLATION'
          ? chosen
            ? (chosen.proofread_text ?? chosen.text)
            : ''
          : region.source_text,
      style: readStyle(region.style, bounds.y1 - bounds.y0 > bounds.x1 - bounds.x0),
    }
  })
}

export async function uploadRendered(
  page: { id: number; cleaned_url: string | null; original_url: string },
  regions: TypesetRegion[],
): Promise<void> {
  const canvas = document.createElement('canvas')
  const image = await loadImage(page.cleaned_url ?? page.original_url)
  await renderTypeset(canvas, image, regions)
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      value => (value ? resolve(value) : reject(new Error('empty canvas'))),
      'image/webp',
      0.95,
    ),
  )
  const body = new FormData()
  body.append('file', new File([blob], `page-${page.id}.webp`, { type: blob.type }))
  await hikariRequest('/api/v3/manga-project-pages/{page_id}/images/{kind}', {
    method: 'put',
    path: { page_id: page.id, kind: 'rendered' },
    body,
  })
}

export async function loadImage(url: string): Promise<HTMLImageElement> {
  const image = new Image()
  image.crossOrigin = 'anonymous'
  image.src = url
  await image.decode()
  return image
}

export async function renderTypeset(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  regions: TypesetRegion[],
): Promise<void> {
  const width = image.naturalWidth
  const height = image.naturalHeight
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('canvas 2d context unavailable')
  context.drawImage(image, 0, 0)
  const drawable = regions.filter(region => region.text && region.vertices.length >= 3)
  await Promise.all(
    drawable.map(region => {
      const font = TYPESET_FONTS[region.style.font]
      return document.fonts.load(`${font.weight} 32px ${font.family}`, region.text)
    }),
  )
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.lineJoin = 'round'
  for (const region of drawable) {
    const bounds = boundsOf(region.vertices, region.x, region.y)
    const left = bounds.x0 * width
    const top = bounds.y0 * height
    const boxWidth = (bounds.x1 - bounds.x0) * width
    const boxHeight = (bounds.y1 - bounds.y0) * height
    if (region.style.fill) {
      context.fillStyle = '#ffffff'
      context.fillRect(left, top, boxWidth, boxHeight)
    }
    const pad = Math.min(boxWidth, boxHeight) * 0.08
    const font = TYPESET_FONTS[region.style.font]
    const { size, glyphs } = fitLayout(
      region.text,
      boxWidth - pad * 2,
      boxHeight - pad * 2,
      region.style,
      (text, candidate) => {
        context.font = `${font.weight} ${candidate}px ${font.family}`
        return context.measureText(text).width
      },
    )
    context.font = `${font.weight} ${size}px ${font.family}`
    const ink = region.style.color === 'white' ? '#ffffff' : '#000000'
    const outline = region.style.color === 'white' ? '#000000' : '#ffffff'
    for (const glyph of glyphs) {
      const x = left + pad + glyph.x
      const y = top + pad + glyph.y
      if (region.style.stroke) {
        context.strokeStyle = outline
        context.lineWidth = size * 0.18
        context.strokeText(glyph.text, x, y)
      }
      context.fillStyle = ink
      context.fillText(glyph.text, x, y)
    }
  }
}
