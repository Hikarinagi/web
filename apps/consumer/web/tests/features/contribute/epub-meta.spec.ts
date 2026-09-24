import { strToU8, zipSync } from 'fflate'
import { readEpubMeta } from '~/features/contribute/epub-meta'

const container = (path: string) =>
  `<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="${path}" media-type="application/oebps-package+xml"/></rootfiles></container>`

const opf = (metadata: string) =>
  `<?xml version="1.0" encoding="utf-8"?><package xmlns="http://www.idpf.org/2007/opf" version="2.0"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">${metadata}</metadata><manifest/><spine/></package>`

function epub(files: Record<string, string>) {
  const bytes = zipSync(
    Object.fromEntries(Object.entries(files).map(([name, text]) => [name, strToU8(text)])),
  )
  return new Blob([bytes], { type: 'application/epub+zip' })
}

it('按 container.xml 定位 OPF，读取书名、作者与 ISBN', async () => {
  const file = epub({
    mimetype: 'application/epub+zip',
    'META-INF/container.xml': container('OEBPS/content.opf'),
    'OEBPS/other.opf': opf('<dc:title>不该读到这里</dc:title>'),
    'OEBPS/content.opf': opf(`
      <dc:title>  魔女之旅
        第 3 卷 </dc:title>
      <dc:title>副标题</dc:title>
      <dc:creator opf:role="aut">白石定规</dc:creator>
      <dc:creator opf:role="ill">あずーる</dc:creator>
      <dc:creator>白石定规</dc:creator>
      <dc:identifier opf:scheme="ISBN">978-7-5594-1234-5</dc:identifier>
      <dc:identifier opf:scheme="uuid">urn:uuid:0f7a6a1e-9780-4f1b-8e3c-123456789012</dc:identifier>
      <dc:identifier>calibre:1234567890123</dc:identifier>`),
  })
  expect(await readEpubMeta(file)).toEqual({
    title: '魔女之旅 第 3 卷',
    creators: ['白石定规', 'あずーる'],
    isbns: ['9787559412345'],
  })
})

it('ISBN-10 与 urn:isbn 写法都转成 13 位', async () => {
  const file = epub({
    'META-INF/container.xml': container('content.opf'),
    'content.opf': opf(`
      <dc:title>书</dc:title>
      <dc:identifier>urn:isbn:9784040703428</dc:identifier>
      <dc:identifier opf:scheme="ISBN">4-04-070342-6</dc:identifier>`),
  })
  expect((await readEpubMeta(file))?.isbns).toEqual(['9784040703428'])
})

it('缺少 container.xml 时改用包内的 OPF', async () => {
  const file = epub({ 'book/package.opf': opf('<dc:title>孤本</dc:title>') })
  expect(await readEpubMeta(file)).toEqual({ title: '孤本', creators: [], isbns: [] })
})

it('文件不是 zip 或缺少元数据时返回 null', async () => {
  expect(await readEpubMeta(new Blob(['not a zip']))).toBeNull()
  expect(await readEpubMeta(epub({ 'readme.txt': 'hello' }))).toBeNull()
})
