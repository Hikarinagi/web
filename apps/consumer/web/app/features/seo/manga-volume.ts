import type { MangaVolumePageData } from '~~/server/api/pages/manga-volumes/[id].get'
import { getMangaVolumeTitle } from '~/utils/media/manga'
import { breadcrumbNode } from './shared'
import { zhText } from '~/utils/seo'

export function mangaVolumeSeo(data: MangaVolumePageData) {
  const volume = data.volume
  const manga = volume.manga
  const seriesName = manga.name_cn || manga.name
  const volTitle = getMangaVolumeTitle(volume)
  const year = volume.publication_date ? new Date(volume.publication_date).getFullYear() : undefined

  const releaseText = year ? `${year} 年发售，` : ''
  const fallbackDesc = `「${seriesName}」${volTitle}，${releaseText}在 Hikarinagi 查看本卷的简介、ISBN、发售信息与同系列全部单行本`

  const book: Record<string, unknown> = {
    '@type': 'Book',
    name: `${seriesName} ${volTitle}`,
    isPartOf: { '@type': 'Book', name: seriesName },
  }
  if (volume.isbn) book.isbn = volume.isbn
  if (volume.publication_date) book.datePublished = volume.publication_date.slice(0, 10)
  if (volume.page_count) book.numberOfPages = volume.page_count

  return {
    title: `「${seriesName}」${volTitle} 漫画单行本`,
    headerTitle: volTitle,
    description: [zhText(volume.summary_cn), zhText(volume.summary), fallbackDesc],
    schema: [
      book,
      breadcrumbNode([
        { name: '首页', item: '/' },
        { name: '漫画', item: '/mangas' },
        { name: seriesName, item: `/mangas/${manga.id}` },
        { name: volTitle, item: `/manga-volumes/${volume.id}` },
      ]),
    ],
  }
}
