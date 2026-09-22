import { toast } from '@hina-ui/vue'
import { NotificationsCheckInMakeUpToast, NotificationsCheckInRewardToast } from '#components'
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

  async function makeUp(date: string) {
    if (makingUp.value) return
    makingUp.value = true
    const id = toast.loading('补签中…')
    try {
      const result = await hikariRequest<'/api/v3/user/me/check-ins/make-up', 'post'>(
        '/api/v3/user/me/check-ins/make-up',
        { method: 'POST', body: { date } },
      )
      toast.custom(NotificationsCheckInMakeUpToast, {
        id,
        props: { cost: result.cost, date: result.date },
      })
      await Promise.all([loadStatus(), loadRecords(month.value)]).catch(() => {})
    } catch {
      toast.dismiss(id)
    } finally {
      makingUp.value = false
    }
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
  }
}
