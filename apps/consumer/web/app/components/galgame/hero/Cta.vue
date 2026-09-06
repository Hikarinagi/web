<script setup lang="ts">
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
  <div class="flex flex-wrap items-stretch gap-3">
    <WorkStatusMenu
      :status="rateCtl.status.value"
      :status-private="rateCtl.statusPrivate.value"
      :options="statusOptions"
      :busy="rateCtl.pending.value"
      @select="value => rateCtl.setStatus(value as GalgameRateStatus)"
      @clear="rateCtl.remove"
      @privacy="rateCtl.setPrivacy"
    />

    <Button
      v-if="rateMode === 'chip'"
      severity="secondary"
      outlined
      class="border-surface-200! bg-surface-0! dark:border-surface-700! dark:bg-surface-900!"
      @click="dialogOpen = true"
    >
      <span class="inline-flex items-center gap-1.5">
        <Star class="size-4 fill-amber-500 text-amber-500" />
        <span class="text-[15px] font-semibold text-color">
          {{ rateCtl.score.value?.toFixed(1) }}
        </span>
        <Pencil class="size-3 text-muted-color" />
      </span>
    </Button>
    <Button
      v-else-if="rateMode === 'prompt'"
      login-required
      severity="secondary"
      outlined
      label="写个评分"
      icon-pos="right"
      class="border-surface-200! text-surface-700! dark:border-surface-700! dark:text-surface-300!"
      @click="dialogOpen = true"
    >
      <template #icon><ArrowRight class="size-3.5" /></template>
    </Button>

    <FavoriteToggle
      :id="galgameId"
      type="galgame"
      :initial-favorited="favorited"
      variant="icon"
      :picker-title="pickerTitle"
    />
    <ShareButton :to="`/galgames/${galgameId}`" tooltip="分享" severity="secondary" outlined />
    <GalgameRateDialog
      v-model:visible="dialogOpen"
      :galgame-id="galgameId"
      :rate="rateCtl.rate.value"
      :work-title="workTitle"
      :upsert="rateCtl.upsert"
      :remove="rateCtl.remove"
    />
  </div>
</template>
