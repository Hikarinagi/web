import { reactive } from 'vue'

export interface PurchaseItem {
  name: string
  description?: string | null
  image?: { src: string } | null
  price: number
}

interface PurchaseRequest extends PurchaseItem {
  title?: string
  confirmLabel?: string
  balance: number
  onConfirm: () => Promise<void>
}

interface PurchaseState {
  open: boolean
  submitting: boolean
  title: string
  confirmLabel: string
  item: PurchaseItem | null
  balance: number
  handler: (() => Promise<void>) | null
}

const state = reactive<PurchaseState>({
  open: false,
  submitting: false,
  title: '兑换确认',
  confirmLabel: '兑换',
  item: null,
  balance: 0,
  handler: null,
})

export function usePurchaseDialog() {
  function open(req: PurchaseRequest) {
    state.title = req.title ?? '兑换确认'
    state.confirmLabel = req.confirmLabel ?? '兑换'
    state.item = {
      name: req.name,
      description: req.description ?? null,
      image: req.image ?? null,
      price: req.price,
    }
    state.balance = req.balance
    state.handler = req.onConfirm
    state.submitting = false
    state.open = true
  }

  async function confirm() {
    if (!state.handler || state.submitting) return
    state.submitting = true
    try {
      await state.handler()
      state.open = false
    } catch {
      /* empty */
    } finally {
      state.submitting = false
    }
  }

  function cancel() {
    if (state.submitting) return
    state.open = false
  }

  return { state, open, confirm, cancel }
}
