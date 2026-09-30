import { reactive } from 'vue'

export interface PurchaseItem {
  name: string
  description?: string | null
  details?: string[]
  image?: { src: string } | null
  price: number
  unit?: { size: number; label: string } | null
}

interface PurchaseRequest extends PurchaseItem {
  title?: string
  confirmLabel?: string
  note?: string
  balance: number
  quantity?: number
  maxQuantity?: number
  onConfirm: (quantity: number) => Promise<void>
}

interface PurchaseState {
  open: boolean
  submitting: boolean
  title: string
  confirmLabel: string
  note: string
  item: PurchaseItem | null
  balance: number
  quantity: number
  maxQuantity: number
  handler: ((quantity: number) => Promise<void>) | null
}

const state = reactive<PurchaseState>({
  open: false,
  submitting: false,
  title: '购买确认',
  confirmLabel: '购买',
  note: '',
  item: null,
  balance: 0,
  handler: null,
  quantity: 1,
  maxQuantity: 1,
})

export function usePurchaseDialog() {
  function open(req: PurchaseRequest) {
    state.title = req.title ?? `购买${req.name}`
    state.confirmLabel = req.confirmLabel ?? '购买'
    state.note = req.note ?? ''
    state.item = {
      name: req.name,
      description: req.description ?? null,
      details: req.details ?? [],
      image: req.image ?? null,
      price: req.price,
      unit: req.unit ?? null,
    }
    state.balance = req.balance
    state.handler = req.onConfirm
    state.quantity = req.quantity ?? 1
    state.maxQuantity = req.maxQuantity ?? 1
    state.submitting = false
    state.open = true
  }

  async function confirm(quantity: number) {
    if (!state.open || !state.handler || state.submitting) return
    state.submitting = true
    try {
      await state.handler(quantity)
      state.open = false
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
