import type { BackendMangaBaselinePage, BackendMangaPage } from '../manga'
import { sizeOf } from './checks'

export function pageSrc(page: BackendMangaPage): string {
  return page.rendered_url ?? page.cleaned_url ?? page.original_url
}

export function pageFacts(page: BackendMangaPage | BackendMangaBaselinePage): string[] {
  return [
    page.width && page.height ? `${page.width} × ${page.height}` : '',
    sizeOf(page.byte_size),
  ].filter(Boolean)
}
