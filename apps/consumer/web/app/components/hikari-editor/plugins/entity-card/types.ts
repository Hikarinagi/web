/**
 * Picker UI 暴露的 entity 类型。
 * 前 8 类是基础 entity,走各自的搜索接口 (/galgames, /people, ...)。
 * galgame_rate / light_novel_rate / manga_rate 是 rate 卡片:数据源是当前用户「我的评分」
 * (/user/me/rates/galgame/cards · /user/me/rates/light-novel/cards · /user/me/rates/manga/cards),
 * 按作品名搜索,插入时落 galgame_rate_card / light_novel_rate_card / manga_rate_card 节点。
 */
export const ENTITY_CARD_TYPES = [
  'galgame',
  'light_novel',
  'light_novel_volume',
  'manga',
  'person',
  'producer',
  'character',
  'article',
  'post',
  'galgame_rate',
  'light_novel_rate',
  'manga_rate',
] as const

export type EntityCardType = (typeof ENTITY_CARD_TYPES)[number]
