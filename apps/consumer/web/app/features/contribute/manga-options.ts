import { mangaChapterNumber } from '@hikarinagi/shared'
import { belongsTo } from '~/features/manga/volumes'
import { getMangaVolumeLabel } from '~/utils/media/manga'
import type { MangaTargetChapter, MangaTargetClaim, MangaTargetVolume } from './manga-target'

export interface TargetOption {
  value: number
  label: string
  description?: string
  disabled?: boolean
  pages?: number
}

const ownerName = (project: MangaTargetClaim) => project.owner.nickname || project.owner.name

export function volumeOptions(
  volumes: MangaTargetVolume[],
  chapters: MangaTargetChapter[],
  claims: MangaTargetClaim[],
  context: { published?: MangaTargetClaim[]; upload?: boolean; viewerId?: number | null } = {},
): TargetOption[] {
  const filled = chapters.filter(
    chapter => chapter.chapter_type === 'VOLUME' && chapter.page_count > 0,
  )
  const claimed = claims.filter(claim => claim.scope === 'VOLUME')
  const uploaded = (context.published ?? []).filter(project => project.scope === 'VOLUME')
  return volumes.map(volume => {
    const label = getMangaVolumeLabel(volume)
    const range = volume.chapters
      ? volume.chapters.first === volume.chapters.last
        ? `第 ${mangaChapterNumber(volume.chapters.first)} 话`
        : `第 ${mangaChapterNumber(volume.chapters.first)} 至 ${mangaChapterNumber(volume.chapters.last)} 话`
      : null
    const note = (state?: string) => [range, state].filter(Boolean).join('。') || undefined
    const claim = claimed.find(item => belongsTo(item, volume))
    if (claim) {
      return {
        value: volume.id,
        label,
        description: note(`${ownerName(claim)} 正在上传`),
        disabled: true,
      }
    }
    const content = filled.find(chapter => belongsTo(chapter, volume))
    if (content && !context.upload) {
      return { value: volume.id, label, description: note('已收录'), disabled: true }
    }
    const upload = uploaded.find(project => belongsTo(project, volume))
    if (upload && upload.owner.id === context.viewerId) {
      return {
        value: volume.id,
        label,
        description: note('由你上传，请在「我的投稿」中更新'),
        disabled: true,
      }
    }
    if (upload) {
      return {
        value: volume.id,
        label,
        description: note(`由 ${ownerName(upload)} 上传`),
        disabled: true,
      }
    }
    if (!content) return { value: volume.id, label, description: note() }
    return {
      value: volume.id,
      label,
      description: note(`已收录 ${content.page_count} 页`),
      pages: content.page_count,
    }
  })
}
