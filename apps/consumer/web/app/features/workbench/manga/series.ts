import { mangaChapterHeading } from '@hikarinagi/shared'
import { topVotedMedia } from '~/utils/media/image'
import type { BackendMangaProjectListItem } from './manga'
import { placementHeading } from './placement'

type Series = BackendMangaProjectListItem['series']

type Episode = Pick<
  BackendMangaProjectListItem,
  | 'scope'
  | 'chapter_type'
  | 'chapter_number'
  | 'chapter_name'
  | 'volume_number'
  | 'placement'
  | 'placement_complete'
>

export function seriesTitle(series: Series): string {
  return series.name_cn || series.name
}

export function seriesHead(series: Series): { title: string; cover: string | null } {
  return { title: seriesTitle(series), cover: topVotedMedia(series.covers)?.src ?? null }
}

export function projectEpisode(project: Episode): string {
  if (!project.placement_complete) {
    return project.placement && project.placement.kind !== 'unknown'
      ? `${placementHeading(project.placement)}（待确认）`
      : '位置待定'
  }
  return mangaChapterHeading({
    chapter_type: project.scope === 'VOLUME' ? 'VOLUME' : project.chapter_type,
    chapter_number: project.chapter_number,
    volume_number: project.volume_number,
    title: project.chapter_name,
  })
}

export function projectTitle(project: Episode & { series: Series }): string {
  return `${seriesTitle(project.series)} ${projectEpisode(project)}`
}
