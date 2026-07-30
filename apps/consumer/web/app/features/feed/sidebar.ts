import type { ApiData } from '@hikarinagi/api-contract/v3'

export type SidebarRateItem = ApiData<'/api/v3/user/me/rates', 'get'>['items'][number]
export type SidebarSuggestedUser = ApiData<'/api/v3/user/me/suggestions', 'get'>['items'][number]
// 关注话题(SidebarTopicDto)与热门话题(TopicDto)共有的最小形状
export type SidebarTopic = { id: number; name: string; use_count: number }
