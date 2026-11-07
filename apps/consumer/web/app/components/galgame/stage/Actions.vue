<script setup lang="ts">
  import { Button as HnButton, Inline, Text } from '@hina-ui/vue'
  import { Download, ExternalLink, Pencil, Star } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { WorkStatusOption } from '~/components/work/StatusMenu.vue'
  import {
    GALGAME_STATUS_LABEL,
    GALGAME_STATUS_ORDER,
    GALGAME_STATUS_SUB,
    type GalgameRate,
    type GalgameRateStatus,
  } from '~/features/galgame/rate'
  import { useGalgameRate } from '~/features/galgame/useGalgameRate'
  import { GALGAME_STATUS_ICON as STATUS_ICON } from '~/features/rate/status-icon'

  defineOptions({ name: 'GalgameStageActions' })
  const props = defineProps<{
    galgameId: number
    workTitle: string
    myRate: GalgameRate | null
    favorited: boolean
    downloads: number
    website?: string
    compact?: boolean
  }>()
  defineEmits<{ rate: [] }>()

  const rateCtl = useGalgameRate(props.galgameId, props.myRate)
  const statusOptions: WorkStatusOption[] = GALGAME_STATUS_ORDER.map(value => ({
    value,
    label: GALGAME_STATUS_LABEL[value],
    sub: GALGAME_STATUS_SUB[value],
    icon: STATUS_ICON[value],
  }))
  const rateMode = computed<'chip' | 'prompt' | 'hidden'>(() => {
    if (rateCtl.status.value === 'PLAN') return 'hidden'
    if (rateCtl.score.value != null) return 'chip'
    if (rateCtl.status.value != null) return 'prompt'
    return 'hidden'
  })
  const pickerTitle = computed(() => `将「${props.workTitle}」添加到收藏夹`)
</script>

<template>
  <Inline gap="sm" align="center">
    <WorkStatusMenu
      :size="compact ? 'sm' : 'md'"
      :status="rateCtl.status.value"
      :status-private="rateCtl.statusPrivate.value"
      :options="statusOptions"
      :busy="rateCtl.pending.value"
      @select="(value, priv) => rateCtl.setStatus(value as GalgameRateStatus, priv)"
      @clear="rateCtl.remove"
      @privacy="rateCtl.setPrivacy"
    />
    <template v-if="!compact">
      <Button v-if="rateMode === 'chip'" variant="soft" tone="neutral" @click="$emit('rate')">
        <template #icon><Star class="fill-current text-warning" /></template>
        {{ rateCtl.score.value?.toFixed(1) }}
        <template #trailing><Pencil class="text-muted" /></template>
      </Button>
      <Button
        v-else-if="rateMode === 'prompt'"
        login-required
        variant="soft"
        tone="neutral"
        @click="$emit('rate')"
      >
        写个评分
      </Button>
      <HnButton
        :as="NuxtLink"
        :to="`/galgames/${galgameId}/downloads`"
        variant="soft"
        tone="neutral"
      >
        <template #icon><Download /></template>
        资源下载
        <Text as="span" size="sm" tone="muted" class="tabular-nums">{{ downloads }}</Text>
      </HnButton>
      <FavoriteToggle
        :id="galgameId"
        type="galgame"
        :initial-favorited="favorited"
        variant="icon"
        size="md"
        :picker-title="pickerTitle"
      />
      <ShareButton :to="`/galgames/${galgameId}`" tooltip="分享" size="md" />
      <WorkEditButton resource-type="galgame" :resource-id="galgameId" />
      <HnButton
        v-if="website"
        as="a"
        :href="website"
        target="_blank"
        rel="noopener noreferrer"
        variant="soft"
        tone="neutral"
        class="hidden sm:inline-flex"
      >
        <template #icon><ExternalLink /></template>
        官网
      </HnButton>
    </template>
  </Inline>
</template>
