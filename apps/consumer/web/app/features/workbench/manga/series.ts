import { topVotedMedia } from '~/utils/media/image'
import { getMangaEpisodeLabel } from '~/utils/media/manga'
import type { BackendMangaProjectListItem } from './manga'

type Series = BackendMangaProjectListItem['series']

export function seriesTitle(series: Series): string {
  return series.name_cn || series.name
}

export function seriesHead(series: Series): { title: string; cover: string | null } {
  return { title: seriesTitle(series), cover: topVotedMedia(series.covers)?.src ?? null }
}

export function projectTitle(project: {
  series: Series
  chapter_number: string | null
  chapter_name: string | null
}): string {
  const episode = getMangaEpisodeLabel({
    chapter_number: project.chapter_number,
    name: project.chapter_name,
  })
  return `${seriesTitle(project.series)} ${episode}`
}
