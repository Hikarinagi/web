import type { InjectionKey } from 'vue'
import type { FavoriteEntityType } from '~/features/favorite/entity'
import type { LikeKind } from '~/features/interaction/useLike'

// 详情页(post/article)提供给移动端评论底栏的互动上下文；底栏 inject 它来渲染 赞/收藏/分享。
// composer 状态另从 COMMENT_THREAD_KEY inject(已由 CommentSection provide)。
export interface CommentDetailActions {
  like: { kind: LikeKind; id: number; count: number; liked: boolean; parentId?: number }
  favorite: { type: FavoriteEntityType; id: number; favorited: boolean; pickerTitle: string }
  shareTo: string
}

export const COMMENT_DETAIL_ACTIONS_KEY: InjectionKey<CommentDetailActions> =
  Symbol('comment-detail-actions')
