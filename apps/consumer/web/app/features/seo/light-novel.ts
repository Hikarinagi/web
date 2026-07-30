import type { LightNovelPageData } from '~~/server/api/pages/light-novels/[id].get'
import { getLightNovelTitle } from '~/utils/media/light-novel'
import { getNovelStatusLabel } from '~/labels/work'
import { breadcrumbNode, ratingNode } from './shared'
import { zhText } from '~/utils/seo'

export function lightNovelSeo(data: LightNovelPageData) {
  const ln = data.light_novel
  const name = getLightNovelTitle(ln)
  const author = data.people.find(p => p.relation === 'author')?.person.name
  const bunko =
    data.producers.find(p => p.relation === 'bunko')?.producer.name ||
    data.producers.find(p => p.relation === 'publisher')?.producer.name
  const total = ln.total_volumes || data.volumes.length
  const status = ln.novel_status ? getNovelStatusLabel(ln.novel_status) : ''
  const readable = data.volumes.some(volume => volume.online_reading_available)

  const parts = [author ? `${author}创作` : '', bunko ? `${bunko}出版` : '']
    .filter(Boolean)
    .join('、')
  const byText = parts ? `是${parts}的轻小说` : `是一部轻小说`
  const meta = [total ? `共 ${total} 卷` : '', status].filter(Boolean).join(' · ')
  const metaText = meta ? `，${meta}` : ''
  const readText = readable ? '免费在线阅读，' : ''
  const fallbackDesc = `「${name}」${byText}${metaText}。在 Hikarinagi ${readText}查看角色、评分与各卷发售信息`

  const book: Record<string, unknown> = { '@type': 'Book' }
  book.name = name
  if (ln.name_cn && ln.name && ln.name_cn !== ln.name) book.alternateName = ln.name
  if (author) book.author = { '@type': 'Person', name: author }
  if (bunko) book.publisher = { '@type': 'Organization', name: bunko }
  if (ln.publication_date) book.datePublished = ln.publication_date.slice(0, 10)
  const rating = ratingNode(data.rate_stats)
  if (rating) book.aggregateRating = rating

  return {
    title: `「${name}」${author ? `${author} ` : ''}轻小说${readable ? '在线阅读' : ''}`,
    headerTitle: name,
    description: [zhText(ln.summary_cn), zhText(ln.summary), fallbackDesc],
    schema: [
      book,
      breadcrumbNode([
        { name: '首页', item: '/' },
        { name: '轻小说', item: '/light-novels' },
        { name, item: `/light-novels/${ln.id}` },
      ]),
    ],
  }
}
