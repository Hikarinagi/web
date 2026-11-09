import type { H3Event } from 'h3'
import MarkdownIt from 'markdown-it'
import { parseRules, type RuleBook } from '~/features/wiki/rules'
import { fetchBackendData } from '~~/server/utils/backend-api'
import { definePageBffHandler } from '~~/server/utils/page-bff'

const markdown = new MarkdownIt()
let book: RuleBook | null = null

async function handler(event: H3Event): Promise<RuleBook> {
  if (book) return book
  const { main, appendix } = await fetchBackendData(event, '/api/v3/wiki/rules')
  book = parseRules([main, appendix], text => markdown.render(text))
  return book
}

export type RulesPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
