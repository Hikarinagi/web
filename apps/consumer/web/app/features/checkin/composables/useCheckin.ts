import { toast } from '@hina-ui/vue'
import { NotificationsCheckInMakeUpToast, NotificationsCheckInRewardToast } from '#components'
import makeUpCardUrl from '~/assets/images/make-up-card.webp'
import { usePurchaseDialog } from '~/features/purchase/usePurchaseDialog'
import type { CheckInRecord, CheckInStatus } from '../checkin'
import { monthOf } from '../checkin'

const visible = ref(false)
const status = ref<CheckInStatus | null>(null)
const month = ref(monthOf(new Date()))
const records = ref<CheckInRecord[]>([])
const recordsMonth = ref('')
const loading = ref(false)
const recordsLoading = ref(false)
const checking = ref(false)
const makingUp = ref(false)

async function loadStatus() {
  status.value = await hikariRequest('/api/v3/user/me/check-ins/status')
}

async function loadRecords(target: string) {
  recordsLoading.value = true
  try {
    const data = await hikariRequest('/api/v3/user/me/check-ins', { query: { month: target } })
    records.value = data.records
    recordsMonth.value = data.month
  } finally {
    recordsLoading.value = false
  }
}

export function useCheckin() {
  const purchaseDialog = usePurchaseDialog()

  async function open() {
    visible.value = true
    loading.value = true
    month.value = monthOf(new Date())
    try {
      await Promise.all([loadStatus(), loadRecords(month.value)])
    } catch {
      /* empty */
    } finally {
      loading.value = false
    }
  }

  async function ensureStatus() {
    if (status.value || loading.value) return
    await loadStatus().catch(() => {})
  }

  function close() {
    visible.value = false
  }

  async function changeMonth(target: string) {
    if (target === month.value) return
    month.value = target
    await loadRecords(target).catch(() => {})
  }

  async function checkIn() {
    if (checking.value || status.value?.checked_in_today) return
    checking.value = true
    const id = toast.loading('签到中…')
    try {
      const result = await hikariRequest<'/api/v3/user/me/check-ins', 'post'>(
        '/api/v3/user/me/check-ins',
        { method: 'POST' },
      )
      toast.custom(NotificationsCheckInRewardToast, {
        id,
        props: {
          date: result.date,
          points: result.points,
          milestone: result.milestone,
        },
      })
      await Promise.all([
        loadStatus(),
        month.value === monthOf(new Date()) ? loadRecords(month.value) : Promise.resolve(),
      ]).catch(() => {})
      return result
    } catch {
      toast.dismiss(id)
    } finally {
      checking.value = false
    }
  }

  async function makeUp(date: string, method: 'points' | 'card') {
    if (makingUp.value) return
    makingUp.value = true
    const id = toast.loading('补签中…')
    try {
      const result = await hikariRequest<'/api/v3/user/me/check-ins/make-up', 'post'>(
        '/api/v3/user/me/check-ins/make-up',
        { method: 'POST', body: { date, method } },
      )
      toast.custom(NotificationsCheckInMakeUpToast, {
        id,
        props: { cost: result.cost, date: result.date, method: result.method },
      })
      return true
    } catch {
      toast.dismiss(id)
      return false
    } finally {
      await Promise.all([loadStatus(), loadRecords(month.value)]).catch(() => {})
      makingUp.value = false
    }
  }

  function openPurchase(date: string) {
    const current = status.value
    const card = current?.make_up.card
    if (!current || !card) return
    if (card.purchased >= card.purchase_limit) {
      toast.warning('本月补签卡已达购买上限，下月可继续购买')
      return
    }
    purchaseDialog.open({
      title: '购买补签卡',
      confirmLabel: '购买并补签',
      name: '补签卡',
      description: `补签最近 ${current.make_up.window_days} 天内的漏签日，有效期 ${card.valid_days} 天。本月已购 ${card.purchased} / ${card.purchase_limit} 张。`,
      image: { src: makeUpCardUrl },
      price: card.next_price,
      balance: current.points,
      note: `购买后将立即用于补签 ${date}`,
      onConfirm: async () => {
        await hikariRequest<'/api/v3/user/me/check-ins/make-up-cards', 'post'>(
          '/api/v3/user/me/check-ins/make-up-cards',
          { method: 'POST' },
        )
        await makeUp(date, 'card')
      },
    })
  }

  return {
    visible,
    status,
    month,
    records,
    recordsMonth,
    loading,
    recordsLoading,
    checking,
    makingUp,
    open,
    close,
    ensureStatus,
    changeMonth,
    checkIn,
    makeUp,
    openPurchase,
  }
}
