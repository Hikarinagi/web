import { inject, provide, ref, watch, type InjectionKey, type Ref } from 'vue'
import { useUserCard, type UserCardData } from './useUserCard'

interface FollowState {
  isFollowing: Ref<boolean>
  isMutual: Ref<boolean>
  followerCount: Ref<number>
  toggling: Ref<boolean>
  toggleFollow: () => Promise<void>
}

const KEY: InjectionKey<FollowState> = Symbol('user-card-follow')

export function provideUserCardFollow(user: Ref<UserCardData | null>): FollowState {
  const { invalidate } = useUserCard()
  const isFollowing = ref(false)
  const isMutual = ref(false)
  const followerCount = ref(0)
  const toggling = ref(false)

  watch(
    user,
    u => {
      if (!u) return
      isFollowing.value = u.is_following
      isMutual.value = u.is_mutual
      followerCount.value = u.follower_count
    },
    { immediate: true },
  )

  async function toggleFollow() {
    const target = user.value
    if (!target || toggling.value) return
    toggling.value = true
    const targetId = target.id
    const wasFollowing = isFollowing.value
    const wasMutual = isMutual.value
    isFollowing.value = !wasFollowing
    isMutual.value = wasFollowing ? false : isMutual.value
    followerCount.value += wasFollowing ? -1 : 1
    try {
      if (wasFollowing) {
        await hikariRequest<'/api/v3/user/{id}/follow', 'delete'>('/api/v3/user/{id}/follow', {
          method: 'DELETE',
          path: { id: targetId },
        })
      } else {
        await hikariRequest<'/api/v3/user/{id}/follow', 'put'>('/api/v3/user/{id}/follow', {
          method: 'PUT',
          path: { id: targetId },
        })
      }
      invalidate(targetId, {
        is_following: isFollowing.value,
        is_mutual: isMutual.value,
        follower_count: followerCount.value,
      })
    } catch {
      isFollowing.value = wasFollowing
      isMutual.value = wasMutual
      followerCount.value += wasFollowing ? 1 : -1
    } finally {
      toggling.value = false
    }
  }

  const state: FollowState = { isFollowing, isMutual, followerCount, toggling, toggleFollow }
  provide(KEY, state)
  return state
}

export function useUserCardFollow(): FollowState {
  const injected = inject(KEY)
  if (!injected) throw new Error('useUserCardFollow must be used inside <UserCard>')
  return injected
}
