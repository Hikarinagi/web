import type { WikiProperty } from './values'

export const CODE_LABELS: Partial<Record<WikiProperty, Record<string, string>>> = {
  MEDIUM: { LIGHT_NOVEL: '轻小说', MANGA: '漫画' },
  PUBLICATION_STATUS: { ONGOING: '出版中', COMPLETED: '已完结', HIATUS: '中断' },
  SERIES_RELATION: {
    SEQUEL: '续作',
    SIDE_STORY: '外传',
    ART_BOOK: '设定集',
    ANTHOLOGY: '选集',
    ADAPTATION: '改编',
    SAME_SERIES: '同系列',
  },
  BOOK_FORMAT: {
    TANKOBON: '单行本',
    BUNKO: '文库本',
    SPECIAL: '特装版、限定版',
    DIGITAL: '电子书',
    REVISED: '改订版',
    EXPANDED: '增补版',
    OMNIBUS: '合订本',
    BOXED_SET: '套装',
    TRANSLATION: '官方译本',
  },
  ORGANIZATION_TYPE: {
    COMPANY: '公司',
    BRAND: '品牌',
    LABEL: '文库',
    MAGAZINE: '杂志',
    PLATFORM: '漫画平台',
    CIRCLE: '同人社团',
    TRANSLATION_GROUP: '翻译团体',
  },
  APPEARANCE_RELATION: { SAME_PERSON: '同一人物' },
  EXTERNAL_LINK: { VNDB: 'VNDB', BANGUMI: 'Bangumi' },
  WEBSITE: {
    OFFICIAL_SITE: '官网',
    OFFICIAL_ACCOUNT: '官方账号',
    AGENCY_PAGE: '所属事务所页面',
  },
  IDENTIFIER: {
    NDL_AUTHORITY: '作者编号',
    NLC_AUTHORITY: '作者编号（中国大陆）',
    NCL_AUTHORITY: '作者编号（台湾）',
    CORPORATE_NUMBER: '公司编号',
    COMPANY_REGISTRY: '公司注册编号',
    LABEL_NAME: '文库名称',
    ISSN: 'ISSN',
    MAGAZINE_CODE: '杂志编号',
  },
}

export const MATCHING_CODES: readonly string[] = [
  'NDL_AUTHORITY',
  'NLC_AUTHORITY',
  'NCL_AUTHORITY',
  'CORPORATE_NUMBER',
  'COMPANY_REGISTRY',
]

export function identifierLabel(code: string): string {
  return CODE_LABELS.IDENTIFIER?.[code] ?? code
}
