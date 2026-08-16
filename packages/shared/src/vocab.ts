export const STAFF_ROLE_CN = {
  GAME_DESIGNER: '游戏设计师',
  DIRECTOR: '导演',
  PRODUCER: '制作人',
  SUPERVISOR: '监修',
  EXECUTIVE_PRODUCER: '制作总指挥',
  ORIGINAL_WORK: '原作',
  CHARACTER_DESIGN: '人物设定',
  MECHANICAL_DESIGN: '机械设定',
  LEVEL_DESIGN: '关卡设计',
  PLANNING: '企画',
  PROGRAM: '程序',
  QC: 'QC',
  SCENARIO: '剧本',
  SERIES_COMPOSITION: '系列构成',
  ANIMATION_SUPERVISOR: '作画监督',
  ART: '原画',
  GRAPHICS: '美工',
  CG_SUPERVISOR: 'CG 监修',
  SD_ART: 'SD原画',
  BACKGROUND: '背景',
  COVER_ART: '海报',
  SOUND_DIRECTOR: '音响监督',
  MUSIC: '音乐',
  THEME_COMPOSITION: '主题歌作曲',
  THEME_LYRICS: '主题歌作词',
  THEME_PERFORMANCE: '主题歌演出',
  INSERT_PERFORMANCE: '插入歌演出',
  ANIMATION_PRODUCTION: '动画制作',
  ANIMATION_DIRECTOR: '动画监督',
  ANIMATION_SCRIPT: '动画剧本',
  COOPERATION: '协力',
  TRANSLATOR: '翻译',
  EDITOR: '编辑',
} as const

export const CHARACTER_ROLE_CN = {
  MAIN: '主角',
  SUPPORTING: '配角',
  GUEST: '客串',
} as const

export const GALGAME_DEV_STATUS_CN = {
  RELEASED: '已发售',
  IN_DEVELOPMENT: '开发中',
  CANCELLED: '开发终止',
} as const

export const PRODUCER_ROLE_CN = {
  DEVELOPER: '开发商',
  PUBLISHER: '发行商',
  LOCALIZER: '本地化',
} as const

export const PRODUCER_TYPE_CN = {
  COMPANY: '厂商',
  DOUJIN: '同人社团',
  INDIVIDUAL: '个人',
  MAGAZINE: '杂志',
} as const

export const MANGA_SERIAL_STATUS_CN = {
  SERIALIZING: '连载中',
  FINISHED: '已完结',
  PAUSED: '暂停连载',
  ABANDONED: '中止连载',
} as const

export const MANGA_STAFF_ROLE_CN = {
  AUTHOR: '作者',
  ART: '作画',
  ORIGINAL_CREATOR: '原作',
  SCRIPT: '脚本',
  ILLUSTRATION: '插图',
  CHARACTER_DESIGN: '人物原案',
} as const

export const MANGA_PRODUCER_ROLE_CN = {
  PUBLISHER: '出版社',
  MAGAZINE: '连载杂志',
  LABEL: '书系',
} as const

export const MANGA_READING_MODE_CN = {
  PAGED_RTL: '从右往左',
  PAGED_LTR: '从左往右',
  WEBTOON: '条漫（竖向滚动）',
} as const

export const MANGA_AUDIENCE_CN = {
  SHONEN: '少年',
  SEINEN: '青年',
  SHOJO: '少女',
  JOSEI: '女性',
} as const

export const NOVEL_STATUS_CN = {
  SERIALIZING: '连载中',
  FINISHED: '已完结',
  PAUSED: '休刊',
  ABANDONED: '休刊',
} as const

export const VOLUME_TYPE_CN = {
  MAIN: '正篇',
  EXTRA: '番外',
} as const

export const USER_ROLE_CN = {
  USER: '用户',
  ADMIN: '管理员',
  SUPER_ADMIN: '超级管理员',
} as const

export const USER_STATUS_CN = {
  ACTIVE: '正常',
  INACTIVE: '未激活',
  BANNED: '已封禁',
} as const

export const WORK_TYPE_CN = {
  GALGAME: 'Galgame',
  LIGHT_NOVEL: '轻小说',
  MANGA: '漫画',
} as const

export const GALGAME_RATE_STATUS_CN = {
  PLAN: '想玩',
  GOING: '在玩',
  COMPLETED: '通关',
  ON_HOLD: '搁置',
  DROPPED: '弃坑',
} as const

export const LIGHT_NOVEL_RATE_STATUS_CN = {
  PLAN: '想读',
  GOING: '在读',
  COMPLETED: '读完',
  ON_HOLD: '搁置',
  DROPPED: '弃读',
} as const

export const MANGA_RATE_STATUS_CN = {
  PLAN: '想看',
  GOING: '在看',
  COMPLETED: '看过',
  ON_HOLD: '搁置',
  DROPPED: '弃坑',
} as const

export const CONTENT_TYPE_CN = {
  galgame: 'Galgame',
  light_novel: '轻小说',
  manga: '漫画',
  article: '文章',
  post: '图文',
} as const
