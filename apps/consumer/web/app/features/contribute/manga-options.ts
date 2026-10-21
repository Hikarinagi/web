import { mangaChapterLabel } from '@hikarinagi/shared'
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
      const claim = claimed.find(claim => belongsTo(claim, volume))
      if (claim) {
        const who = claim.owner.nickname || claim.owner.name
        return { value: volume.id, label, description: `${who} 正在上传`, disabled: true }
      }
      const content = filled.find(chapter => belongsTo(chapter, volume))
      if (!content) return { value: volume.id, label }
      const upload = uploaded.find(project => belongsTo(project, volume))
      if (!context.upload) {
        return { value: volume.id, label, description: '已收录', disabled: true }
      }
      if (upload?.owner.id === context.viewerId) {
        return {
          value: volume.id,
          label,
          description: '由你上传。请在『我的投稿』中更新',
          disabled: true,
        }
      }
      if (upload) {
        const who = upload.owner.nickname || upload.owner.name
        return { value: volume.id, label, description: `由 ${who} 上传`, disabled: true }
      }
      return {
        value: volume.id,
        label,
        description: `已收录 · ${content.page_count} 页`,
        pages: content.page_count,
      }
    }),
    { value: NEW_TARGET, label: '新建这一卷的条目…' },
  ]
}

export function firstFree(options: TargetOption[]): number | null {
  const found = options.find(
    option => !option.disabled && option.pages === undefined && option.value !== NEW_TARGET,
  )
  return typeof found?.value === 'number' ? found.value : null
}
