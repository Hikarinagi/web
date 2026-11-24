import { mangaChapterNumber } from '@hikarinagi/shared'
import type { BackendMangaProject } from './manga'

export type MangaPlacement = NonNullable<BackendMangaProject['placement']>

const PROBLEM_TEXT: Record<NonNullable<MangaPlacement['problem']>, string> = {
  no_volume: '维基里没有对应的卷',
  several: '收录了几话',
  extra: '看不出番外的标题',
  taken: '这一卷或这一话已有其他投稿',
  refused: '这个位置无法放入',
  flawed: '文件有问题',
  failed: '未能确定位置',
  unsettled: '未能确定位置',
  unreadable: '图片无法读取',
}

const CONFIDENCE_TEXT: Record<MangaPlacement['confidence'], string> = {
  high: '把握高',
  medium: '把握一般',
  low: '把握低',
}

const SOURCE_TEXT: Record<MangaPlacement['source'], string> = {
  mechanical: '封面比对',
  model: '看图',
}

export function placementHeading(placement: MangaPlacement): string {
  const number = (value: number | null) => mangaChapterNumber(String(value ?? ''))
  if (placement.kind === 'volume') {
    const edition = placement.set_name ?? placement.edition
    return `${edition ?? ''}${placement.volume === null ? '单行本' : `第 ${placement.volume} 卷`}`
  }
  if (placement.kind === 'chapters') {
    return placement.first === placement.last
      ? `第 ${number(placement.first)} 话`
      : `第 ${number(placement.first)} 至 ${number(placement.last)} 话`
  }
  if (placement.kind === 'extra') return placement.title ? `番外「${placement.title}」` : '番外'
  return '无法确定'
}

export function placementBasis(placement: MangaPlacement): string {
  return placement.evidence.map(item => item.note).join('；')
}

export function placementLine(placement: MangaPlacement): string {
  const basis = placementBasis(placement)
  return basis ? `${placementHeading(placement)}：${basis}` : placementHeading(placement)
}

export function placementMethod(placement: MangaPlacement): string {
  return placement.source === 'mechanical' || placement.kind === 'unknown'
    ? SOURCE_TEXT[placement.source]
    : `${SOURCE_TEXT[placement.source]}，${CONFIDENCE_TEXT[placement.confidence]}`
}

export function placementOutcome(placement: MangaPlacement): string {
  if (placement.applied) return '已确定'
  const reasons = [
    placement.problem ? PROBLEM_TEXT[placement.problem] : null,
    placement.hint_agrees === false ? '与投稿者填写的不一致' : null,
  ].filter(Boolean)
  return reasons.length ? `${reasons.join('，')}，待审核员确定` : '待审核员确定'
}
