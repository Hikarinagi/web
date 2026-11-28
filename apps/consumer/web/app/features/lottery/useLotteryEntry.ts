import { toast } from '@hina-ui/vue'
import { HIKARI_BIZ_CODE } from '@hikarinagi/shared'
import { apiErrorMessage, isApiError } from '~/utils/api/error'
import type { BackendLottery } from './lottery'

export function useLotteryEntry(source: () => BackendLottery) {
  const lottery = shallowRef(source())
  watch(source, next => (lottery.value = next))

  const dialogOpen = ref(false)
  const flagged = ref(false)
  const joining = ref(false)
  const following = ref(false)
  const ineligible = computed(() => {
    const value = lottery.value.viewer.ineligible
    if (!value) return ''
    const reason = translate(`lottery.exclusion.${value}`, {
      days: lottery.value.min_account_days,
      preset: lottery.value.preset_label,
    })
    return translate('lottery.ineligible', { reason })
  })

  async function refresh() {
    lottery.value = await hikariRequest('/api/v3/lotteries/{id}', {
      path: { id: lottery.value.id },
    })
  }

  async function join() {
    if (joining.value) return
    joining.value = true
    try {
      lottery.value = await hikariRequest('/api/v3/lotteries/{id}/entries', {
        method: 'POST',
        path: { id: lottery.value.id },
        toast: false,
      })
      dialogOpen.value = false
      toast.success(translate('lottery.joinedToast'))
    } catch (error) {
      if (isApiError(error) && error.code === HIKARI_BIZ_CODE.LOTTERY_CONDITION_UNMET) {
        flagged.value = dialogOpen.value
        await refresh().catch(() => undefined)
        dialogOpen.value = true
      } else {
        toast.danger(isApiError(error) ? apiErrorMessage(error) : translate('lottery.joinFailed'))
      }
    } finally {
      joining.value = false
    }
  }

  async function follow() {
    if (following.value) return
    following.value = true
    try {
      await hikariRequest('/api/v3/user/{id}/follow', {
        method: 'PUT',
        path: { id: lottery.value.organizer.id },
      })
      await refresh()
    } finally {
      following.value = false
    }
  }

  return { lottery, ineligible, dialogOpen, flagged, joining, following, refresh, join, follow }
}
