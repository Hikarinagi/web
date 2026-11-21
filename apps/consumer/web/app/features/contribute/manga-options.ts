import { mangaChapterLabel, mangaChapterNumber } from '@hikarinagi/shared'
import { belongsTo } from '~/features/manga/volumes'
import { getMangaVolumeLabel } from '~/utils/media/manga'
import type { MangaTargetChapter, MangaTargetClaim, MangaTargetVolume } from './manga-target'

export const NEW_TARGET = 'new'

export interface TargetOption {
  value: number | typeof NEW_TARGET
  label: string
  description?: string
  disabled?: boolean
  pages?: number
}

const ownerName = (project: MangaTargetClaim) => project.owner.nickname || project.owner.name

export function chapterOptions(
  chapters: MangaTargetChapter[],
  claims: MangaTargetClaim[],
): TargetOption[] {
  const taken = new Set(claims.map(claim => claim.chapter?.id))
  return [
    ...chapters
      .filter(chapter => chapter.chapter_type !== 'VOLUME' && !chapter.page_count)
      .map(chapter => {
        const label = mangaChapterLabel(chapter)
        return taken.has(chapter.id)
          ? { value: chapter.id, label: `${label}（进行中）`, disabled: true }
          : { value: chapter.id, label }
      }),
    { value: NEW_TARGET, label: '新章节' },
  ]
}

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
  return [
    ...volumes.map(volume => {
      const label = getMangaVolumeLabel(volume)
      const range = volume.chapters
        ? volume.chapters.first === volume.chapters.last
          ? `第 ${mangaChapterNumber(volume.chapters.first)} 话`
          : `第 ${mangaChapterNumber(volume.chapters.first)} 至 ${mangaChapterNumber(volume.chapters.last)} 话`
        : null
      const contents = [
        range,
        ...volume.editions.map(edition =>
          edition.title ? `${edition.title}：${edition.note}` : edition.note,
        ),
      ].filter(Boolean)
      const note = (state?: string) =>
        [contents.join('；'), state].filter(Boolean).join('。') || undefined
      const claim = claimed.find(item => item.part === null && belongsTo(item, volume))
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
      const upload = uploaded.find(project => project.part === null && belongsTo(project, volume))
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
      const parts = [...claimed, ...uploaded]
        .filter(project => project.part !== null && belongsTo(project, volume))
        .map(project => project.part!)
        .sort((a, b) => a - b)
      if (parts.length) {
        return {
          value: volume.id,
          label,
          description: note(`第 ${[...new Set(parts)].join('、')} 册已有投稿`),
        }
      }
      if (!content) return { value: volume.id, label, description: note() }
      return {
        value: volume.id,
        label,
        description: note(`已收录 ${content.page_count} 页`),
        pages: content.page_count,
      }
    }),
    { value: NEW_TARGET, label: '新建单行本…' },
  ]
}

export function firstFree(options: TargetOption[]): number | null {
  const found = options.find(
    option => !option.disabled && option.pages === undefined && option.value !== NEW_TARGET,
  )
  return typeof found?.value === 'number' ? found.value : null
}
