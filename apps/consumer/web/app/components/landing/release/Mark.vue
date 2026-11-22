<script setup lang="ts">
  import type { WorkStatusOption } from '~/components/work/StatusMenu.vue'
  import {
    GALGAME_STATUS_LABEL,
    GALGAME_STATUS_ORDER,
    GALGAME_STATUS_SUB,
    type GalgameRateStatus,
  } from '~/features/galgame/rate'
  import { useGalgameRate } from '~/features/galgame/useGalgameRate'
  import { GALGAME_STATUS_ICON } from '~/features/rate/status-icon'

  defineOptions({ name: 'LandingReleaseMark' })
  const props = defineProps<{ galgameId: number }>()

  const auth = useAuthStore()
  const rate = useGalgameRate(props.galgameId, null)
  const options: WorkStatusOption[] = GALGAME_STATUS_ORDER.map(value => ({
    value,
    label: GALGAME_STATUS_LABEL[value],
    sub: GALGAME_STATUS_SUB[value],
    icon: GALGAME_STATUS_ICON[value],
  }))

  onMounted(async () => {
    if (!auth.isAuthenticated || rate.rate.value) return
    try {
      rate.rate.value = await hikariRequest<'/api/v3/galgames/{id}/rate', 'get'>(
        '/api/v3/galgames/{id}/rate',
        { method: 'get', path: { id: props.galgameId }, toast: false },
      )
    } catch {
      rate.rate.value = null
    }
  })
</script>

<template>
  <WorkStatusMenu
    :status="rate.status.value"
    :status-private="rate.statusPrivate.value"
    :options="options"
    :busy="rate.pending.value"
    @select="(value, priv) => rate.setStatus(value as GalgameRateStatus, priv)"
    @clear="rate.remove"
    @privacy="rate.setPrivacy"
  />
</template>
