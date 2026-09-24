import { strFromU8, unzipSync } from 'fflate'

export interface EpubMeta {
  title: string | null
  creators: string[]
  isbns: string[]
}

const CONTAINER_PATH = 'META-INF/container.xml'
const ISBN_LIKE = /^(?:urn:isbn:|isbn:?\s*)?[\d\s-]{9,17}[\dXx]$/i

function parseXml(bytes: Uint8Array | undefined): Document | null {
  if (!bytes) return null
  const doc = new DOMParser().parseFromString(strFromU8(bytes), 'application/xml')
  return doc.getElementsByTagName('parsererror').length ? null : doc
}

function elements(root: Document | Element | null | undefined, name: string): Element[] {
  if (!root) return []
  return [...root.getElementsByTagName('*')].filter(
    node => node.tagName.split(':').pop()?.toLowerCase() === name,
  )
}

function isbnOf(node: Element): string | null {
  const raw = node.textContent?.trim() ?? ''
  const scheme = [...node.attributes].some(
    attr => /scheme$/i.test(attr.name) && /isbn/i.test(attr.value),
  )
  if (!scheme && !ISBN_LIKE.test(raw)) return null
  const digits = raw.replace(/[^\dXx]/g, '').toUpperCase()
  if (/^97[89]\d{10}$/.test(digits)) return digits
  if (!/^\d{9}[\dX]$/.test(digits)) return null
  const body = `978${digits.slice(0, 9)}`
  const sum = [...body].reduce((acc, digit, index) => acc + Number(digit) * (index % 2 ? 3 : 1), 0)
  return `${body}${(10 - (sum % 10)) % 10}`
}

export async function readEpubMeta(file: Blob): Promise<EpubMeta | null> {
  let entries: Record<string, Uint8Array>
  try {
    entries = unzipSync(new Uint8Array(await file.arrayBuffer()), {
      filter: entry => entry.name === CONTAINER_PATH || /\.opf$/i.test(entry.name),
    })
  } catch {
    return null
  }
  const rootPath = elements(parseXml(entries[CONTAINER_PATH]), 'rootfile')[0]?.getAttribute(
    'full-path',
  )
  const opf =
    (rootPath ? entries[rootPath] : undefined) ??
    Object.entries(entries).find(([name]) => /\.opf$/i.test(name))?.[1]
  const metadata = elements(parseXml(opf), 'metadata')[0]
  if (!metadata) return null

  const texts = (name: string) =>
    elements(metadata, name)
      .map(node => node.textContent?.replace(/\s+/g, ' ').trim() ?? '')
      .filter(Boolean)
  const isbns = elements(metadata, 'identifier')
    .map(isbnOf)
    .filter((isbn): isbn is string => isbn !== null)
  return {
    title: texts('title')[0]?.slice(0, 500) ?? null,
    creators: [...new Set(texts('creator').map(name => name.slice(0, 200)))].slice(0, 10),
    isbns: [...new Set(isbns)].slice(0, 10),
  }
}
