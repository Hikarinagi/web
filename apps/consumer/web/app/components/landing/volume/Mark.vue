<script setup lang="ts">
  import type { WorkStatusOption } from '~/components/work/StatusMenu.vue'
  import {
    LIGHT_NOVEL_STATUS_LABEL,
    LIGHT_NOVEL_STATUS_ORDER,
    LIGHT_NOVEL_STATUS_SUB,
    type LightNovelRateStatus,
  } from '~/features/light-novel/rate'
  import { useLightNovelRate } from '~/features/light-novel/useLightNovelRate'
  import { LIGHT_NOVEL_STATUS_ICON } from '~/features/rate/status-icon'

  defineOptions({ name: 'LandingVolumeMark' })
  const props = defineProps<{ lightNovelId: number }>()

  const auth = useAuthStore()
  const rate = useLightNovelRate(props.lightNovelId, null)
  const options: WorkStatusOption[] = LIGHT_NOVEL_STATUS_ORDER.map(value => ({
    value,
    label: LIGHT_NOVEL_STATUS_LABEL[value],
    sub: LIGHT_NOVEL_STATUS_SUB[value],
    icon: LIGHT_NOVEL_STATUS_ICON[value],
  }))

  onMounted(async () => {
    if (!auth.isAuthenticated || rate.rate.value) return
    try {
      rate.rate.value = await hikariRequest<'/api/v3/light-novels/{id}/rate', 'get'>(
        '/api/v3/light-novels/{id}/rate',
        { method: 'get', path: { id: props.lightNovelId }, toast: false },
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
    @select="(value, priv) => rate.setStatus(value as LightNovelRateStatus, priv)"
    @clear="rate.remove"
    @privacy="rate.setPrivacy"
  />
</template>
