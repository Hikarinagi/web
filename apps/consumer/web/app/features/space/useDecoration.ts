import { push } from 'notivue'
import type { ApiData } from '@hikarinagi/api-contract/v3'
import { usePurchaseDialog } from '~/features/decoration/usePurchaseDialog'

export type ShopDecoration = ApiData<'/api/v3/decorations', 'get'>['items'][number]
export type OwnedDecoration = ApiData<'/api/v3/user/me/decorations', 'get'>['items'][number]

export interface DecorationData {
  equipped_frame_id: number | null
  equipped_badge_ids: number[]
  owned: OwnedDecoration[]
  catalog: ShopDecoration[]
  points: number
}

const BADGE_LIMIT = 3

export function useDecoration(
  getData: () => DecorationData | null,
  refresh: () => Promise<unknown>,
) {
  const auth = useAuthStore()
  const purchaseDialog = usePurchaseDialog()

  const points = computed(() => getData()?.points ?? 0)
  const ownedAll = computed<OwnedDecoration[]>(() => getData()?.owned ?? [])
  const catalogAll = computed<ShopDecoration[]>(() => getData()?.catalog ?? [])

  const ownedFrames = computed(() => ownedAll.value.filter(item => item.type === 'AVATAR_FRAME'))
  const ownedBadges = computed(() => ownedAll.value.filter(item => item.type === 'BADGE'))
  const catalogFrames = computed(() =>
    catalogAll.value.filter(item => item.type === 'AVATAR_FRAME'),
  )
  const catalogBadges = computed(() => catalogAll.value.filter(item => item.type === 'BADGE'))
  const ownedIds = computed(() => new Set(ownedAll.value.map(item => item.id)))

  const selectedFrameId = ref<number | null>(null)
  watch(
    () => getData()?.equipped_frame_id,
    value => {
      selectedFrameId.value = value ?? null
    },
    { immediate: true },
  )
  const selectedFrame = computed<OwnedDecoration | null>(
    () => ownedFrames.value.find(item => item.id === selectedFrameId.value) ?? null,
  )

  const selectedBadgeIds = ref<number[]>([])
  watch(
    () => getData()?.equipped_badge_ids,
    value => {
      selectedBadgeIds.value = value ? [...value] : []
    },
    { immediate: true },
  )
  const selectedBadges = computed<OwnedDecoration[]>(() =>
    selectedBadgeIds.value
      .map(id => ownedBadges.value.find(item => item.id === id))
      .filter((item): item is OwnedDecoration => Boolean(item)),
  )

  const equippingFrame = ref(false)
  const equippingBadges = ref(false)

  async function equipFrame(frameId: number | null) {
    if (equippingFrame.value || frameId === selectedFrameId.value) return
    const previous = selectedFrameId.value
    selectedFrameId.value = frameId
    equippingFrame.value = true
    try {
      await hikariRequest<'/api/v3/user/me/decorations/equipped', 'put'>(
        '/api/v3/user/me/decorations/equipped',
        { method: 'PUT', body: { frame_id: frameId } },
      )
      const me = await hikariRequest('/api/v3/user/me', { toast: false })
      auth.setUser(me)
    } catch {
      selectedFrameId.value = previous
    } finally {
      equippingFrame.value = false
    }
  }

  async function toggleBadge(badgeId: number) {
    if (equippingBadges.value) return
    const current = selectedBadgeIds.value
    const has = current.includes(badgeId)
    if (!has && current.length >= BADGE_LIMIT) {
      push.warning({ message: `最多佩戴 ${BADGE_LIMIT} 枚徽章` })
      return
    }
    const previous = current
    const next = has ? current.filter(id => id !== badgeId) : [...current, badgeId]
    selectedBadgeIds.value = next
    equippingBadges.value = true
    try {
      await hikariRequest<'/api/v3/user/me/decorations/badges', 'put'>(
        '/api/v3/user/me/decorations/badges',
        { method: 'PUT', body: { badge_ids: next } },
      )
      const me = await hikariRequest('/api/v3/user/me', { toast: false })
      auth.setUser(me)
    } catch {
      selectedBadgeIds.value = previous
    } finally {
      equippingBadges.value = false
    }
  }

  function purchase(item: ShopDecoration) {
    if (item.price == null) return
    purchaseDialog.open({
      title: item.type === 'BADGE' ? '兑换徽章' : '兑换头像框',
      name: item.name,
      description: item.description,
      image: item.image,
      price: item.price,
      balance: points.value,
      onConfirm: () => runPurchase(item.id),
    })
  }

  async function runPurchase(id: number) {
    await hikariRequest<'/api/v3/user/me/decorations', 'post'>('/api/v3/user/me/decorations', {
      method: 'POST',
      body: { decoration_id: id },
    })
    await refresh()
    push.success({ message: '已收入装扮库' })
  }

  return {
    points,
    ownedFrames,
    ownedBadges,
    catalogFrames,
    catalogBadges,
    ownedIds,
    selectedFrameId,
    selectedFrame,
    selectedBadgeIds,
    selectedBadges,
    equippingFrame,
    equippingBadges,
    badgeLimit: BADGE_LIMIT,
    equipFrame,
    toggleBadge,
    purchase,
  }
}
