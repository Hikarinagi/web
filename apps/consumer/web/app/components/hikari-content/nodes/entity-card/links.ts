/**
 * Entity card 外链路由表。display 侧 Container.vue + 各 type 组件统一从这里取 href。
 * Rate 卡按 plan §4'.1 路由到所在作品页(单独 rate 详情页若以后出再调整)。
 */
export type EntityCardLinkType =
  | 'galgame'
  | 'light_novel'
  | 'light_novel_volume'
  | 'manga'
  | 'person'
  | 'producer'
  | 'character'
  | 'article'
  | 'post'

export function entityHref(type: EntityCardLinkType, id: number): string {
  switch (type) {
    case 'galgame':
      return `/galgames/${id}`
    case 'light_novel':
      return `/light-novels/${id}`
    case 'light_novel_volume':
      return `/light-novel-volumes/${id}`
    case 'manga':
      return `/mangas/${id}`
    case 'person':
      return `/people/${id}`
    case 'producer':
      return `/producers/${id}`
    case 'character':
      return `/characters/${id}`
    case 'article':
      return `/articles/${id}`
    case 'post':
      return `/posts/${id}`
  }
}

export function rateWorkHref(
  rateType: 'galgame_rate' | 'light_novel_rate' | 'manga_rate',
  workId: number,
): string {
  switch (rateType) {
    case 'galgame_rate':
      return `/galgames/${workId}`
    case 'light_novel_rate':
      return `/light-novels/${workId}`
    case 'manga_rate':
      return `/mangas/${workId}`
  }
}
