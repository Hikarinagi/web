const IMAGE_FILE = /\.(jpe?g|png|webp|avif|gif|bmp)$/i
const TEXT_FILE = /\.(x?html?|xml|opf)$/i

function text(archive: Record<string, Uint8Array>, path: string) {
  const data = archive[path]
  return data ? new TextDecoder().decode(data) : null
}

function parse(source: string, type: DOMParserSupportedType) {
  const doc = new DOMParser().parseFromString(source, type)
  return doc.querySelector('parsererror') ? null : doc
}

function resolve(base: string, href: string) {
  const parts = base.split('/').slice(0, -1)
  for (const segment of decodeURIComponent(href.split('#')[0] ?? '').split('/')) {
    if (segment === '..') parts.pop()
    else if (segment && segment !== '.') parts.push(segment)
  }
  return parts.join('/')
}

function imageOf(archive: Record<string, Uint8Array>, path: string) {
  if (IMAGE_FILE.test(path)) return archive[path] ? path : null
  if (!TEXT_FILE.test(path)) return null
  const source = text(archive, path)
  const doc = source ? (parse(source, 'application/xhtml+xml') ?? parse(source, 'text/html')) : null
  if (!doc) return null
  const node = doc.querySelector('img[src], image')
  const href =
    node?.getAttribute('src') ??
    node?.getAttribute('href') ??
    node?.getAttribute('xlink:href') ??
    node?.getAttributeNS('http://www.w3.org/1999/xlink', 'href')
  if (!href) return null
  const target = resolve(path, href)
  return archive[target] && IMAGE_FILE.test(target) ? target : null
}

export function epubImageEntries(archive: Record<string, Uint8Array>): string[] | null {
  const container = text(archive, 'META-INF/container.xml')
  const containerDoc = container ? parse(container, 'application/xml') : null
  const opfPath = containerDoc?.querySelector('rootfile')?.getAttribute('full-path') ?? null
  const opfSource = opfPath ? text(archive, opfPath) : null
  const opf = opfSource ? parse(opfSource, 'application/xml') : null
  if (!opf || !opfPath) return null
  const items = new Map<string, string>()
  for (const item of opf.querySelectorAll('manifest > item')) {
    const id = item.getAttribute('id')
    const href = item.getAttribute('href')
    if (id && href) items.set(id, resolve(opfPath, href))
  }
  const ordered: string[] = []
  const seen = new Set<string>()
  for (const ref of opf.querySelectorAll('spine > itemref')) {
    const path = items.get(ref.getAttribute('idref') ?? '')
    const image = path ? imageOf(archive, path) : null
    if (image && !seen.has(image)) {
      seen.add(image)
      ordered.push(image)
    }
  }
  return ordered.length ? ordered : null
}
