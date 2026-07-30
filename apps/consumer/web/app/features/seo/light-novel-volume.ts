import type { LightNovelVolumePageData } from '~~/server/api/pages/light-novel-volumes/[id].get'
import { getLightNovelTitle, getLightNovelVolumeTitle } from '~/utils/media/light-novel'
import { breadcrumbNode } from './shared'
import { zhText } from '~/utils/seo'

export function lightNovelVolumeSeo(data: LightNovelVolumePageData) {
  const volume = data.volume
  const ln = data.light_novel
  const seriesName = getLightNovelTitle(ln)
  const volTitle = getLightNovelVolumeTitle(volume)
  const year = volume.publication_date ? new Date(volume.publication_date).getFullYear() : undefined

  const readable = volume.online_reading_available
  const releaseText = year ? `${year} 年发售，` : ''
  const readText = readable ? '免费在线阅读本卷，' : ''
  const fallbackDesc = `「${seriesName}」${volTitle}，${releaseText}在 Hikarinagi ${readText}查看简介、ISBN、发售信息与系列全部分卷`

  const book: Record<string, unknown> = {
    '@type': 'Book',
    name: `${seriesName} ${volTitle}`,
    isPartOf: { '@type': 'Book', name: seriesName },
  }
  if (volume.isbn) book.isbn = volume.isbn
  if (volume.publication_date) book.datePublished = volume.publication_date.slice(0, 10)
  if (volume.pages) book.numberOfPages = volume.pages

  return {
    title: `「${seriesName}」${volTitle} ${readable ? '轻小说在线阅读' : '轻小说'}`,
    headerTitle: volTitle,
    description: [zhText(volume.summary_cn), zhText(volume.summary), fallbackDesc],
    schema: [
      book,
      breadcrumbNode([
        { name: '首页', item: '/' },
        { name: '轻小说', item: '/light-novels' },
        { name: seriesName, item: `/light-novels/${ln.id}` },
        { name: volTitle, item: `/light-novel-volumes/${volume.id}` },
      ]),
    ],
  }
}
