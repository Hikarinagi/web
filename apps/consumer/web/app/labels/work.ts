import type { components } from '@hikarinagi/api-contract/v3'

export const NOVEL_STATUS_LABELS: Record<string, string> = {
  SERIALIZING: '连载中',
  FINISHED: '已完结',
  PAUSED: '暂停连载',
  ABANDONED: '中止连载',
}

export const CHARACTER_ROLE_LABELS = {
  MAIN: '主角',
  PRIMARY: '主要角色',
  SUPPORTING: '配角',
  GUEST: '客串',
} satisfies Record<components['schemas']['CharacterRole'], string>

const VOLUME_TYPE_LABELS: Record<string, string> = {
  MAIN: '本篇',
  EXTRA: '番外',
}

const LIGHT_NOVEL_PERSON_RELATION_LABELS: Record<string, string> = {
  author: '作者',
  illustrator: '插画',
}

const LIGHT_NOVEL_PRODUCER_RELATION_LABELS: Record<string, string> = {
  bunko: '文库',
  publisher: '出版',
}

export const NOVEL_RELATION_LABELS: Record<string, string> = {
  SERIES: '系列',
  PREQUEL: '前作',
  SEQUEL: '续作',
  SIDE_STORY: '外传',
  MAIN_STORY: '主线故事',
  SAME_UNIVERSE: '同一世界观',
  DIFFERENT_UNIVERSE: '不同世界观',
  VARIANT: '不同版本',
  DIFFERENT_ADAPTATION: '不同改编',
  CHARACTER: '角色出演',
  COLLABORATION: '联动',
  OTHER: '相关',
}

export function getNovelStatusLabel(value: string) {
  return NOVEL_STATUS_LABELS[value] ?? value
}

export function characterRoleLabel(value: string | null | undefined) {
  return (
    (value && CHARACTER_ROLE_LABELS[value as keyof typeof CHARACTER_ROLE_LABELS]) || value || ''
  )
}

export function getVolumeTypeLabel(value: string) {
  return VOLUME_TYPE_LABELS[value] ?? value
}

export function getLightNovelPersonRelationLabel(value: string) {
  return LIGHT_NOVEL_PERSON_RELATION_LABELS[value] ?? value
}

export function getLightNovelProducerRelationLabel(value: string) {
  return LIGHT_NOVEL_PRODUCER_RELATION_LABELS[value] ?? value
}

export function getNovelRelationLabel(value: string) {
  return NOVEL_RELATION_LABELS[value] ?? value
}
