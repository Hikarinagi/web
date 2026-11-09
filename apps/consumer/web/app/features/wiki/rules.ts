export interface RuleClause {
  id: string
  section: string
  text: string
  html: string
}

export interface RuleSection {
  id: string
  title: string
  level: 2 | 3
  intro: string
  clauses: string[]
}

export interface RuleBook {
  title: string
  edition: string
  sections: RuleSection[]
  clauses: RuleClause[]
}

const SPACE = String.fromCharCode(0x3000)
const CLAUSE = /^((?:A\.)?\d+(?:\.\d+)+)\s/
const HEADING = /^(#{1,3})\s+(.+)$/

export const rulePath = (clause: string) => `/create/wiki/rules/${clause}`
export const sectionName = (section: Pick<RuleSection, 'id' | 'title'>) =>
  section.title === section.id ? section.title : `${section.id}${SPACE}${section.title}`

export function parseRules(documents: string[], render: (markdown: string) => string): RuleBook {
  const sections: RuleSection[] = []
  const bodies = new Map<string, string[]>()
  let title = ''
  let edition = ''
  let section: RuleSection | null = null
  let clause: string | null = null
  for (const document of documents) {
    for (const block of document
      .split(/\n{2,}/)
      .map(item => item.trim())
      .filter(Boolean)) {
      const heading = HEADING.exec(block)
      if (heading) {
        const level = Math.max(heading[1]!.length, 2) as 2 | 3
        if (!title) {
          title = heading[2]!
          continue
        }
        const [id = '', ...rest] = heading[2]!.split(SPACE)
        section = { id, title: rest.join(SPACE) || id, level, intro: '', clauses: [] }
        sections.push(section)
        clause = null
        continue
      }
      if (!edition && /^第 \d+ 版/.test(block)) {
        edition = block
        continue
      }
      const id = CLAUSE.exec(block)?.[1]
      if (id && section) {
        clause = id
        section.clauses.push(id)
        bodies.set(id, [block])
        continue
      }
      if (clause) bodies.get(clause)!.push(block)
      else if (section) section.intro += `${block}\n\n`
    }
  }
  const known = new Set(bodies.keys())
  const linked = (markdown: string) =>
    markdown.replace(/(?<![\d.A-Za-z])((?:A\.)?\d+(?:\.\d+)+)(?![\d.]*\d)/g, match =>
      known.has(match) ? `[${match}](${rulePath(match)})` : match,
    )
  const clauses = sections.flatMap(item =>
    item.clauses.map(id => {
      const markdown = bodies.get(id)!.join('\n\n')
      return {
        id,
        section: item.id,
        text: markdown,
        html: render(`**${id}**${SPACE}${linked(markdown.replace(CLAUSE, ''))}`),
      }
    }),
  )
  for (const item of sections) item.intro = item.intro ? render(linked(item.intro)) : ''
  return { title, edition, sections, clauses }
}
