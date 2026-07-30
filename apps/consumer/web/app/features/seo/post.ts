import type { PostPageData } from '~~/server/api/pages/posts/[id].get'
import { breadcrumbNode } from './shared'

export function postSeo(data: PostPageData) {
  const p = data.post
  const authorName = p.creator?.name
  const excerpt = p.content_meta.excerpt
  const title = p.title || excerpt || '短文'
  const byText = authorName ? `${authorName} 的` : ''
  const fallbackDesc = `${byText}分享。在 Hikarinagi 阅读，和大家一起参与讨论吧！`

  const article: Record<string, unknown> = { '@type': 'Article', headline: title }
  if (excerpt) article.description = excerpt
  if (authorName) article.author = { '@type': 'Person', name: authorName }
  article.datePublished = p.created_at
  article.dateModified = p.updated_at

  return {
    title,
    description: [excerpt, fallbackDesc],
    schema: [
      article,
      breadcrumbNode([
        { name: '首页', item: '/' },
        { name: title, item: `/posts/${p.id}` },
      ]),
    ],
  }
}
