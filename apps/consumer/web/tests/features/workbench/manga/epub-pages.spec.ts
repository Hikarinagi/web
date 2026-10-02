import { describe, expect, it } from 'vitest'
import { epubImageEntries } from '~/features/workbench/manga/epub-pages'

const encode = (value: string) => new TextEncoder().encode(value)

function book(spine: string[], extra: Record<string, Uint8Array> = {}) {
  return {
    'META-INF/container.xml': encode(
      '<?xml version="1.0"?><container xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>',
    ),
    'OEBPS/content.opf': encode(
      `<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0"><manifest>
        <item id="p1" href="text/one.xhtml" media-type="application/xhtml+xml"/>
        <item id="p2" href="text/two.xhtml" media-type="application/xhtml+xml"/>
        <item id="svg" href="text/svg.xhtml" media-type="application/xhtml+xml"/>
        <item id="raw" href="images/raw.png" media-type="image/png"/>
        <item id="a" href="images/a.jpg" media-type="image/jpeg"/>
        <item id="b" href="images/b%20space.jpg" media-type="image/jpeg"/>
        <item id="c" href="images/c.webp" media-type="image/webp"/>
      </manifest><spine>${spine.map(id => `<itemref idref="${id}"/>`).join('')}</spine></package>`,
    ),
    'OEBPS/text/one.xhtml': encode(
      '<html xmlns="http://www.w3.org/1999/xhtml"><body><img src="../images/a.jpg"/></body></html>',
    ),
    'OEBPS/text/two.xhtml': encode(
      '<html xmlns="http://www.w3.org/1999/xhtml"><body><div><img src="../images/b%20space.jpg" alt=""/></div></body></html>',
    ),
    'OEBPS/text/svg.xhtml': encode(
      '<html xmlns="http://www.w3.org/1999/xhtml"><body><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><image xlink:href="../images/c.webp"/></svg></body></html>',
    ),
    'OEBPS/images/a.jpg': new Uint8Array([1]),
    'OEBPS/images/b space.jpg': new Uint8Array([2]),
    'OEBPS/images/c.webp': new Uint8Array([3]),
    'OEBPS/images/raw.png': new Uint8Array([4]),
    ...extra,
  }
}

describe('epubImageEntries', () => {
  it('follows the spine, resolves relative paths and reads svg images', () => {
    expect(epubImageEntries(book(['p2', 'svg', 'p1', 'raw']))).toEqual([
      'OEBPS/images/b space.jpg',
      'OEBPS/images/c.webp',
      'OEBPS/images/a.jpg',
      'OEBPS/images/raw.png',
    ])
  })

  it('skips pages without an image and duplicates', () => {
    expect(epubImageEntries(book(['p1', 'p1', 'missing']))).toEqual(['OEBPS/images/a.jpg'])
  })

  it('returns null when the package cannot be read', () => {
    expect(epubImageEntries({ 'images/a.jpg': new Uint8Array([1]) })).toBeNull()
    const broken = book(['p1'])
    broken['OEBPS/content.opf'] = encode('<package><manifest>')
    expect(epubImageEntries(broken)).toBeNull()
  })
})
