import type { ArticlePageData } from '~~/server/api/pages/articles/[id].get'
import { breadcrumbNode } from './shared'

export function articleSeo(data: ArticlePageData) {
  const a = data.article
  const isReview = Boolean(a.related_galgame_rate_id || a.related_light_novel_rate_id)
  const authorName = a.creator?.name
  const excerpt = a.content_meta.excerpt
  const kind = isReview ? '长评' : '文章'
  const byText = authorName ? `${authorName} 的` : ''
  const fallbackDesc = `${byText}${kind}「${a.title}」。在 Hikarinagi 阅读这篇${kind}，和大家一起参与讨论吧！`

  const article: Record<string, unknown> = { '@type': 'Article', headline: a.title }
  if (excerpt) article.description = excerpt
  if (authorName) article.author = { '@type': 'Person', name: authorName }
  article.datePublished = a.created_at
  article.dateModified = a.updated_at

  return {
    title: a.title,
    description: [excerpt, fallbackDesc],
    schema: [
      article,
      breadcrumbNode([
        { name: '首页', item: '/' },
        { name: a.title, item: `/articles/${a.id}` },
      ]),
    ],
  }
}
