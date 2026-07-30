import type { MangaPageData } from '~~/server/api/pages/mangas/[id].get'
import { getMangaTitle } from '~/utils/media/manga'
import { mangaSerialStatusLabel } from '~/features/manga/labels'
import { breadcrumbNode, ratingNode } from './shared'
import { zhText } from '~/utils/seo'

export function mangaSeo(data: MangaPageData) {
  const manga = data.manga
  const name = getMangaTitle(manga)
  const author = data.people.find(p => p.role === 'AUTHOR')?.person.name
  const magazine = data.producers.find(p => p.role === 'MAGAZINE')?.producer.name
  const publisher = data.producers.find(p => p.role === 'PUBLISHER')?.producer.name
  const volumeCount = data.volumes.length
  const status = mangaSerialStatusLabel(manga.serial_status)
  const readable = data.chapters.some(chapter => chapter.readable)

  const parts = [
    author ? `${author}创作` : '',
    magazine ? `于「${magazine}」连载` : publisher ? `${publisher}出版` : '',
  ]
    .filter(Boolean)
    .join('、')
  const byText = parts ? `是${parts}的漫画` : '是一部漫画'
  const meta = [volumeCount ? `单行本 ${volumeCount} 卷` : '', status].filter(Boolean).join(' · ')
  const metaText = meta ? `，${meta}` : ''
  const readText = readable ? '在线看全话，' : ''
  const fallbackDesc = `「${name}」${byText}${metaText}。在 Hikarinagi ${readText}查看章节列表、登场角色与评分`

  const comic: Record<string, unknown> = { '@type': 'ComicSeries' }
  comic.name = name
  if (manga.name_cn && manga.name && manga.name_cn !== manga.name) comic.alternateName = manga.name
  if (author) comic.author = { '@type': 'Person', name: author }
  if (publisher) comic.publisher = { '@type': 'Organization', name: publisher }
  if (manga.publication_date) comic.datePublished = manga.publication_date.slice(0, 10)
  const rating = ratingNode(data.rate_stats)
  if (rating) comic.aggregateRating = rating

  return {
    title: `「${name}」${author ? `${author} ` : ''}漫画${readable ? '在线看' : ''}`,
    headerTitle: name,
    description: [zhText(manga.summary_cn), zhText(manga.summary), fallbackDesc],
    schema: [
      comic,
      breadcrumbNode([
        { name: '首页', item: '/' },
        { name: '漫画', item: '/mangas' },
        { name, item: `/mangas/${manga.id}` },
      ]),
    ],
  }
}
