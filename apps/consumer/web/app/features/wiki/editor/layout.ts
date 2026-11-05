import type { EditableEntry } from './draft'

type EntryType = EditableEntry['type']
type Property = EditableEntry['statements'][number]['property']

export interface PropertyGroup {
  title: string
  properties: Property[]
}

const LINKS: PropertyGroup = {
  title: '链接',
  properties: ['WEBSITE', 'IDENTIFIER', 'EXTERNAL_LINK'],
}

export const HIDDEN_PROPERTIES: readonly Property[] = ['CHARACTER', 'LABEL_NUMBER']

export const ENTRY_GROUPS: Record<EntryType, PropertyGroup[]> = {
  GAME: [
    {
      title: '标题',
      properties: ['TITLE', 'READING', 'CHINESE_TITLE', 'ENGLISH_TITLE', 'ALIAS'],
    },
    { title: '介绍', properties: ['GENRE_TEXT', 'ORIGINAL_INTRO', 'CHINESE_INTRO'] },
    LINKS,
  ],
  PRODUCT: [
    {
      title: '发行',
      properties: [
        'TITLE',
        'INCLUDED_GAME',
        'RELEASE_DATE',
        'RELEASE_STATUS',
        'PRICE',
        'AGE_RATING',
        'JAN',
        'PRODUCT_CODE',
        'CHANNEL_CODE',
      ],
    },
    { title: '规格', properties: ['PLATFORM', 'LANGUAGE', 'SPECIFICATION', 'BONUS', 'COVER'] },
    { title: '制作信息', properties: ['CREDIT'] },
  ],
  SERIES: [
    {
      title: '基本资料',
      properties: [
        'TITLE',
        'READING',
        'CHINESE_TITLE',
        'ENGLISH_TITLE',
        'ALIAS',
        'MEDIUM',
        'PUBLICATION_STATUS',
        'COVER',
      ],
    },
    { title: '介绍', properties: ['ORIGINAL_INTRO', 'CHINESE_INTRO'] },
    LINKS,
  ],
  VOLUME: [{ title: '卷', properties: ['SERIES', 'TITLE', 'VOLUME_NUMBER', 'ORDER', 'INTRO'] }],
  BOOK: [
    {
      title: '出版版本',
      properties: [
        'INCLUDED_VOLUME',
        'TITLE',
        'READING',
        'ISBN',
        'JAN',
        'BOOK_FORMAT',
        'RELEASE_DATE',
        'RELEASE_STATUS',
        'PRICE',
        'PAGE_COUNT',
        'TRIM_SIZE',
        'AGE_RATING',
        'BONUS',
        'COVER',
      ],
    },
    { title: '作者与制作信息', properties: ['CREDIT'] },
  ],
  PERSON: [{ title: '基本资料', properties: ['NAME', 'GENDER', 'INTRO', 'MEMBER'] }, LINKS],
  ORGANIZATION: [
    {
      title: '基本资料',
      properties: [
        'NAME',
        'ORGANIZATION_TYPE',
        'LOCATION',
        'FOUNDED_DATE',
        'END_DATE',
        'INTRO',
        'PARENT',
        'MEMBER',
      ],
    },
    LINKS,
  ],
  CHARACTER: [],
  APPEARANCE: [
    { title: '基本资料', properties: ['WORK', 'LABEL', 'NAME', 'CREDIT'] },
    {
      title: '介绍与资料',
      properties: [
        'OFFICIAL_INTRO',
        'IMAGE',
        'GENDER',
        'AGE',
        'BIRTHDAY',
        'HEIGHT',
        'WEIGHT',
        'MEASUREMENTS',
        'BLOOD_TYPE',
        'SITE_GROUP',
        'APPEARANCE_RELATION',
      ],
    },
    LINKS,
  ],
}

export function groupsOf(
  type: EntryType,
  defined: readonly Property[],
  elsewhere: readonly Property[] = [],
): PropertyGroup[] {
  const shown = defined.filter(item => !elsewhere.includes(item))
  const groups = ENTRY_GROUPS[type]
    .map(group => ({
      ...group,
      properties: group.properties.filter(item => shown.includes(item)),
    }))
    .filter(group => group.properties.length)
  const placed = new Set(groups.flatMap(group => group.properties))
  const rest = shown.filter(item => !placed.has(item) && !HIDDEN_PROPERTIES.includes(item))
  return rest.length ? [...groups, { title: '其他', properties: rest }] : groups
}
