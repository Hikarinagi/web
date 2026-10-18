import { topVotedMedia } from '~/utils/media/image'
import { getMangaEpisodeLabel } from '~/utils/media/manga'
import type { BackendMangaProjectListItem } from './manga'

type Series = BackendMangaProjectListItem['series']

type Episode = Pick<
  BackendMangaProjectListItem,
  'scope' | 'chapter_number' | 'chapter_name' | 'volume_number'
>

export function seriesTitle(series: Series): string {
  return series.name_cn || series.name
}

export function seriesHead(series: Series): { title: string; cover: string | null } {
  return { title: seriesTitle(series), cover: topVotedMedia(series.covers)?.src ?? null }
}

export function projectEpisode(project: Episode): string {
  return getMangaEpisodeLabel({
    chapter_type: project.scope === 'VOLUME' ? 'VOLUME' : null,
    chapter_number: project.chapter_number,
    volume_number: project.volume_number,
    name: project.chapter_name,
  })
}

export function projectTitle(project: Episode & { series: Series }): string {
  return `${seriesTitle(project.series)} ${projectEpisode(project)}`
}
