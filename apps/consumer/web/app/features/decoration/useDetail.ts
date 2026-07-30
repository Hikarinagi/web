import { computed, ref } from 'vue'
import { push } from 'notivue'
import type { ApiData } from '@hikarinagi/api-contract/v3'
import { usePurchaseDialog } from './usePurchaseDialog'

type DecorationDetail = ApiData<'/api/v3/decorations/{id}', 'get'>

const visible = ref(false)
const loading = ref(false)
const detail = ref<DecorationDetail | null>(null)
const ownedIds = ref<Set<number>>(new Set())
const buying = ref(false)
let ownedLoaded = false

export function useDecorationDetail() {
  const auth = useAuthStore()
  const purchase = usePurchaseDialog()

  async function ensureOwned() {
    if (ownedLoaded || !auth.user) return
    ownedLoaded = true
    const res = await hikariRequest('/api/v3/user/me/decorations', { toast: false }).catch(
      () => null,
    )
    if (res) ownedIds.value = new Set(res.items.map(item => item.id))
  }

  async function open(id: number) {
    visible.value = true
    loading.value = true
    detail.value = null
    void ensureOwned()
    detail.value = await hikariRequest('/api/v3/decorations/{id}', {
      path: { id },
      method: 'get',
      toast: false,
    }).catch(() => null)
    loading.value = false
    if (!detail.value) visible.value = false
  }

  const owned = computed(() => (detail.value ? ownedIds.value.has(detail.value.id) : false))
  const canBuy = computed(() =>
    Boolean(auth.user && detail.value && detail.value.price != null && !owned.value),
  )

  async function buy() {
    const target = detail.value
    if (!target || target.price == null || buying.value) return
    buying.value = true
    const status = await hikariRequest('/api/v3/user/me/status', { toast: false }).catch(() => null)
    buying.value = false
    visible.value = false
    purchase.open({
      title: target.type === 'BADGE' ? '兑换徽章' : '兑换头像框',
      name: target.name,
      description: target.description,
      image: target.image,
      price: target.price,
      balance: status?.hikari_point ?? 0,
      onConfirm: async () => {
        await hikariRequest('/api/v3/user/me/decorations', {
          method: 'POST',
          body: { decoration_id: target.id },
        })
        ownedIds.value = new Set([...ownedIds.value, target.id])
        push.success({ message: '已收入装扮库' })
      },
    })
  }

  return { visible, loading, detail, owned, canBuy, buying, open, buy }
}
