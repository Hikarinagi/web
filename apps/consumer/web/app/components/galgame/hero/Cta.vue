<script setup lang="ts">
  import { Button, Inline } from '@hina-ui/vue'
  import { ArrowRight, Pencil, Star } from '@lucide/vue'
  import type { WorkStatusOption } from '~/components/work/StatusMenu.vue'
  import { useGalgameRate } from '~/features/galgame/useGalgameRate'
  import {
    GALGAME_STATUS_LABEL,
    GALGAME_STATUS_ORDER,
    GALGAME_STATUS_SUB,
    type GalgameRate,
    type GalgameRateStatus,
  } from '~/features/galgame/rate'
  import { GALGAME_STATUS_ICON as STATUS_ICON } from '~/features/rate/status-icon'

  defineOptions({ name: 'GalgameHeroCta' })

  const props = defineProps<{
    galgameId: number
    workTitle: string
    myRate: GalgameRate | null
    favorited: boolean
  }>()

  const rateCtl = useGalgameRate(props.galgameId, props.myRate)

  const statusOptions: WorkStatusOption[] = GALGAME_STATUS_ORDER.map(value => ({
    value,
    label: GALGAME_STATUS_LABEL[value],
    sub: GALGAME_STATUS_SUB[value],
    icon: STATUS_ICON[value],
  }))

  const dialogOpen = ref(false)
  const rateMode = computed<'chip' | 'prompt' | 'hidden'>(() => {
    if (rateCtl.status.value === 'PLAN') return 'hidden'
    if (rateCtl.score.value != null) return 'chip'
    if (rateCtl.status.value != null) return 'prompt'
    return 'hidden'
  })
  const pickerTitle = computed(() => `将「${props.workTitle}」添加到收藏夹`)
</script>

<template>
  <Inline>
    <WorkStatusMenu
      size="lg"
      :status="rateCtl.status.value"
      :status-private="rateCtl.statusPrivate.value"
      :options="statusOptions"
      :busy="rateCtl.pending.value"
      @select="(value, priv) => rateCtl.setStatus(value as GalgameRateStatus, priv)"
      @clear="rateCtl.remove"
      @privacy="rateCtl.setPrivacy"
    />

    <Button
      v-if="rateMode === 'chip'"
      size="lg"
      variant="outline"
      tone="neutral"
      @click="dialogOpen = true"
    >
      <template #icon>
        <Star class="fill-current text-warning" />
      </template>
      {{ rateCtl.score.value?.toFixed(1) }}
      <template #trailing>
        <Pencil class="text-muted" />
      </template>
    </Button>
    <AuthGateButton
      v-else-if="rateMode === 'prompt'"
      size="lg"
      variant="outline"
      tone="neutral"
      @click="dialogOpen = true"
    >
      写个评分
      <template #trailing><ArrowRight /></template>
    </AuthGateButton>

    <FavoriteToggle
      :id="galgameId"
      type="galgame"
      :initial-favorited="favorited"
      variant="icon"
      size="lg"
      :picker-title="pickerTitle"
    />
    <ShareButton :to="`/galgames/${galgameId}`" tooltip="分享" size="lg" />
    <WorkEditButton resource-type="galgame" :resource-id="galgameId" size="lg" />
    <GalgameRateDialog
      v-model:visible="dialogOpen"
      :galgame-id="galgameId"
      :rate="rateCtl.rate.value"
      :work-title="workTitle"
      :upsert="rateCtl.upsert"
      :remove="rateCtl.remove"
    />
  </Inline>
</template>
