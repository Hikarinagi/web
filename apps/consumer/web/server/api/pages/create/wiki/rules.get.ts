import MarkdownIt from 'markdown-it'
import { parseRules, type RuleBook } from '~/features/wiki/rules'
import { definePageBffHandler } from '~~/server/utils/page-bff'

const markdown = new MarkdownIt()
let book: RuleBook | null = null

async function handler(): Promise<RuleBook> {
  if (book) return book
  const storage = useStorage('assets:server')
  const [main, appendix] = await Promise.all([
    storage.getItem<string>('rules/main.md'),
    storage.getItem<string>('rules/appendix.md'),
  ])
  book = parseRules([String(main ?? ''), String(appendix ?? '')], text => markdown.render(text))
  return book
}

export type RulesPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
