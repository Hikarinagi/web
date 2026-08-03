import { createHighlighter, type Highlighter } from 'shiki'

export type CodeLang = 'bash' | 'json' | 'javascript'

let highlighterPromise: Promise<Highlighter> | undefined

function getHighlighter() {
  highlighterPromise ??= createHighlighter({
    themes: ['github-light', 'github-dark'],
    langs: ['bash', 'json', 'javascript'],
  })
  return highlighterPromise
}

export async function highlightCode(code: string, lang: CodeLang): Promise<string> {
  const highlighter = await getHighlighter()
  return highlighter.codeToHtml(code, {
    lang,
    themes: { light: 'github-light', dark: 'github-dark' },
    defaultColor: false,
  })
}
