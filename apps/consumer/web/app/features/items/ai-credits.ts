import type { ApiData } from '@hikarinagi/api-contract/v3'
import { toast } from '@hina-ui/vue'
import aiCreditsUrl from '~/assets/images/ai-credits.webp'
import { usePurchaseDialog } from '~/features/purchase/usePurchaseDialog'

export type BackendAiCredits = ApiData<'/api/v3/user/me/ai-credits', 'get'>

export const AI_CREDITS_NAME = 'AI 积分'
export const AI_CREDITS_DESCRIPTION = '用于召唤某种神秘力量的小道具'
export const AI_CREDITS_IMAGE = { src: aiCreditsUrl }

export function aiCreditsItem(credits: BackendAiCredits) {
  return {
    name: AI_CREDITS_NAME,
    description: AI_CREDITS_DESCRIPTION,
    image: AI_CREDITS_IMAGE,
    price: credits.pack_price,
    unit: { size: credits.pack_credits, label: '积分' },
    details: [`持有 ${credits.balance} 积分`, '长期有效'],
  }
}

export function useAiCredits() {
  const credits = ref<BackendAiCredits | null>(null)
  const dialog = usePurchaseDialog()

  async function load() {
    credits.value = await hikariRequest('/api/v3/user/me/ai-credits', { toast: false }).catch(
      () => null,
    )
  }

  function purchase(onPurchased?: (next: BackendAiCredits) => unknown) {
    const current = credits.value
    if (!current) return
    dialog.open({
      ...aiCreditsItem(current),
      title: `购买 ${AI_CREDITS_NAME}`,
      balance: current.points,
      maxQuantity: Math.min(Math.floor(current.points / current.pack_price), 100_000),
      onConfirm: async quantity => {
        credits.value = await hikariRequest('/api/v3/user/me/ai-credits', {
          method: 'POST',
          body: { quantity },
        })
        toast.success(`${AI_CREDITS_NAME}已加入道具库`)
        await onPurchased?.(credits.value)
      },
    })
  }

  return { credits, load, purchase }
}
