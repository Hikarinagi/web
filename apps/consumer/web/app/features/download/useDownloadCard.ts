import { ref, watch } from 'vue'
import type { ApiData } from '@hikarinagi/api-contract/v3'
import downloadCardUrl from '~/assets/images/novel-download-card.webp'
import { usePurchaseDialog } from '~/features/purchase/usePurchaseDialog'

type DownloadCards = ApiData<'/api/v3/user/me/download/cards', 'get'>

export function useDownloadCard(
  status: () => DownloadCards | null,
  onPurchased: (cards: DownloadCards) => void | Promise<void>,
) {
  const dialog = usePurchaseDialog()
  const purchasing = ref(false)

  watch(
    () => dialog.state.open,
    visible => {
      if (!visible) purchasing.value = false
    },
  )

  function purchase(quantity = 1) {
    const cards = status()
    if (!cards || purchasing.value) return
    purchasing.value = true
    dialog.open({
      title: '购买下载卡',
      name: '下载卡',
      description: '用于下载小说分卷和漫画',
      details: [`持有 ${cards.available} 张`, `本月已购买 ${cards.purchased} 张`, '长期有效'],
      image: { src: downloadCardUrl },
      price: cards.price,
      quantity,
      maxQuantity: 10000,
      balance: cards.points,
      onConfirm: async count => {
        const result = await hikariRequest('/api/v3/user/me/download/cards', {
          method: 'POST',
          body: { quantity: count },
        })
        await onPurchased(result)
      },
    })
  }

  return { purchasing, purchase }
}
