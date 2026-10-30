import type { BackendEntryProperty, BackendEntryType } from './contract'

export interface PropertyGroup {
  title: string
  properties: BackendEntryProperty[]
}

export const GAME_GROUPS: PropertyGroup[] = [
  { title: '标题', properties: ['TITLE', 'READING', 'CHINESE_TITLE', 'ENGLISH_TITLE', 'ALIAS'] },
  {
    title: '简介与类型说明',
    properties: ['ORIGINAL_INTRO', 'CHINESE_INTRO', 'ENGLISH_INTRO', 'GENRE_TEXT'],
  },
  { title: '关系', properties: ['GAME_RELATION'] },
  { title: '改编', properties: ['ADAPTATION'] },
  { title: '官网与外部链接', properties: ['WEBSITE', 'EXTERNAL_LINK'] },
]

export const PRODUCT_GROUPS: PropertyGroup[] = [
  { title: '发行版本', properties: ['TITLE', 'JAN', 'PRODUCT_CODE', 'CHANNEL_CODE'] },
  {
    title: '发售',
    properties: [
      'RELEASE_DATE',
      'RELEASE_STATUS',
      'FULL_RELEASE_DATE',
      'END_OF_SERVICE_DATE',
      'PRICE',
      'PLATFORM',
      'LANGUAGE',
      'AGE_RATING',
      'ADULT_PATCH',
    ],
  },
  { title: '内容', properties: ['INCLUDED_GAME', 'BONUS', 'SPECIFICATION', 'COVER'] },
  { title: '制作信息', properties: ['CREDIT'] },
]

const TITLES: PropertyGroup = {
  title: '标题',
  properties: ['TITLE', 'READING', 'CHINESE_TITLE', 'ENGLISH_TITLE', 'ALIAS'],
}

export const ENTRY_GROUPS: Partial<Record<BackendEntryType, PropertyGroup[]>> = {
  GAME: [...GAME_GROUPS, { title: '制作信息', properties: ['CREDIT'] }],
  PRODUCT: PRODUCT_GROUPS,
  SERIES: [
    TITLES,
    { title: '简介', properties: ['ORIGINAL_INTRO', 'CHINESE_INTRO', 'ENGLISH_INTRO'] },
    { title: '出版信息', properties: ['MEDIUM', 'PUBLICATION_STATUS'] },
    { title: '制作信息', properties: ['CREDIT'] },
    { title: '关系', properties: ['SERIES_RELATION'] },
    { title: '改编', properties: ['ADAPTATION'] },
    { title: '外部链接', properties: ['EXTERNAL_LINK'] },
  ],
  VOLUME: [
    { title: '卷', properties: ['SERIES', 'TITLE', 'VOLUME_NUMBER', 'ORDER'] },
    { title: '简介', properties: ['INTRO'] },
  ],
  BOOK: [
    { title: '出版版本', properties: ['TITLE', 'READING', 'ISBN', 'JAN', 'BOOK_FORMAT'] },
    { title: '收录的卷', properties: ['INCLUDED_VOLUME'] },
    {
      title: '发售',
      properties: ['RELEASE_DATE', 'PRICE', 'PAGE_COUNT', 'TRIM_SIZE', 'AGE_RATING'],
    },
    { title: '内容', properties: ['BONUS', 'COVER'] },
    { title: '中文版', properties: ['CHINESE_EDITION_REGION', 'CHINESE_EDITION_VOLUME'] },
    { title: '制作信息', properties: ['CREDIT'] },
  ],
  PERSON: [
    { title: '人物', properties: ['NAME', 'GENDER', 'IDENTIFIER'] },
    { title: '简介', properties: ['INTRO'] },
    { title: '成员', properties: ['MEMBER'] },
    { title: '官网与外部链接', properties: ['WEBSITE', 'EXTERNAL_LINK'] },
  ],
  ORGANIZATION: [
    {
      title: '组织',
      properties: [
        'NAME',
        'ORGANIZATION_TYPE',
        'LOCATION',
        'IDENTIFIER',
        'FOUNDED_DATE',
        'END_DATE',
      ],
    },
    { title: '简介', properties: ['INTRO'] },
    { title: '上级组织与成员', properties: ['PARENT', 'MEMBER'] },
    { title: '官网与外部链接', properties: ['WEBSITE', 'EXTERNAL_LINK'] },
  ],
  APPEARANCE: [
    { title: '出场角色', properties: ['LABEL', 'WORK', 'CHARACTER', 'SITE_GROUP'] },
    { title: '名字', properties: ['NAME'] },
    { title: '配音', properties: ['CREDIT'] },
    { title: '介绍', properties: ['OFFICIAL_INTRO', 'MEMBER_INTRO'] },
    {
      title: '资料',
      properties: ['HEIGHT', 'MEASUREMENTS', 'GENDER', 'AGE', 'BIRTHDAY', 'WEIGHT', 'BLOOD_TYPE'],
    },
    { title: '与其他出场角色的关系', properties: ['APPEARANCE_RELATION'] },
    { title: '外部链接', properties: ['EXTERNAL_LINK'] },
  ],
}
