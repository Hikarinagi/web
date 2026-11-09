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

export const WIDE_PROPERTIES: readonly Property[] = [
  'INCLUDED_GAME',
  'INCLUDED_VOLUME',
  'SERIES',
  'TITLE',
  'RELEASE_STATUS',
  'PUBLICATION_STATUS',
  'PRICE',
  'PLATFORM',
  'LANGUAGE',
  'CHANNEL_CODE',
  'BONUS',
  'SPECIFICATION',
  'INTRO',
  'EXTERNAL_LINK',
]

export const FIELD_LABELS: Partial<Record<EntryType, Partial<Record<Property, string>>>> = {
  GAME: { CREDIT: '译者' },
}

export const PANEL_PROPERTIES: readonly Property[] = ['CREDIT', 'COVER', 'IMAGE', 'SAMPLE_IMAGE']

export const ENTRY_GROUPS: Record<EntryType, PropertyGroup[]> = {
  GAME: [
    {
      title: '标题',
      properties: ['TITLE', 'READING', 'CHINESE_TITLE', 'ENGLISH_TITLE', 'ALIAS'],
    },
    { title: '介绍', properties: ['GENRE_TEXT', 'ORIGINAL_INTRO', 'CHINESE_INTRO'] },
    LINKS,
    { title: '非官方汉化', properties: ['CREDIT'] },
  ],
  PRODUCT: [
    {
      title: '发行',
      properties: [
        'INCLUDED_GAME',
        'TITLE',
        'RELEASE_DATE',
        'AGE_RATING',
        'RELEASE_STATUS',
        'PRICE',
      ],
    },
    { title: '规格', properties: ['PLATFORM', 'LANGUAGE', 'SPECIFICATION', 'BONUS'] },
    { title: '编号', properties: ['JAN', 'PRODUCT_CODE', 'CHANNEL_CODE'] },
    { title: '制作信息', properties: ['CREDIT'] },
    { title: '封面', properties: ['COVER'] },
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
  VOLUME: [{ title: '卷', properties: ['TITLE', 'VOLUME_NUMBER', 'ORDER', 'INTRO', 'SERIES'] }],
  BOOK: [
    {
      title: '出版版本',
      properties: ['INCLUDED_VOLUME', 'TITLE', 'READING', 'BOOK_FORMAT', 'ISBN', 'JAN'],
    },
    { title: '发售', properties: ['RELEASE_DATE', 'AGE_RATING', 'RELEASE_STATUS', 'PRICE'] },
    { title: '规格', properties: ['PAGE_COUNT', 'TRIM_SIZE', 'BONUS'] },
    { title: '链接', properties: ['EXTERNAL_LINK'] },
    { title: '作者与制作信息', properties: ['CREDIT'] },
    { title: '封面', properties: ['COVER'] },
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
    {
      title: '基本资料',
      properties: [
        'WORK',
        'LABEL',
        'NAME',
        'CREDIT',
        'CAST_ROLE',
        'PROTAGONIST',
        'CAPTURABLE',
        'ORDER',
      ],
    },
    {
      title: '介绍与资料',
      properties: [
        'OFFICIAL_INTRO',
        'GENDER',
        'AGE',
        'BIRTHDAY',
        'HEIGHT',
        'WEIGHT',
        'MEASUREMENTS',
        'BLOOD_TYPE',
        'SITE_GROUP',
      ],
    },
    LINKS,
    { title: '图片', properties: ['IMAGE'] },
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
