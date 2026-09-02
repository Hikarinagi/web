<script setup lang="ts">
  import { ArrowRight, Pencil, Play, Star } from '@lucide/vue'
  import type { LightNovelPageData } from '~~/server/api/pages/light-novels/[id].get'
  import type { WorkStatusOption } from '~/components/work/StatusMenu.vue'
  import { useLightNovelRate } from '~/features/light-novel/useLightNovelRate'
  import {
    LIGHT_NOVEL_STATUS_LABEL,
    LIGHT_NOVEL_STATUS_ORDER,
    LIGHT_NOVEL_STATUS_SUB,
    type LightNovelRate,
    type LightNovelRateStatus,
  } from '~/features/light-novel/rate'
  import { LIGHT_NOVEL_STATUS_ICON as STATUS_ICON } from '~/features/rate/status-icon'
  import { getLightNovelVolumeLabel, getLightNovelVolumeTitle } from '~/utils/media/light-novel'

  defineOptions({ name: 'LightNovelHeroCta' })

  const props = defineProps<{
    lightNovelId: number
    title: string
    volumes: LightNovelPageData['volumes']
    myRate: LightNovelRate | null
    favorited: boolean
    progress: LightNovelPageData['progress']
  }>()

  const startTarget = computed(() => {
    const readable = props.volumes.filter(volume => volume.online_reading_available)
    const pool = readable.length ? readable : props.volumes
    return [...pool].sort(compareVolumes)[0] ?? null
  })
  const canRead = computed(() => props.volumes.some(volume => volume.online_reading_available))
  const continueInfo = computed(() => {
    const cid = props.progress?.continue_volume_id
    if (!cid) return null
    const entry = props.progress?.progresses.find(item => item.volume_id === cid)
    const volume = props.volumes.find(item => item.id === cid)
    if (!entry || !volume) return null
    return {
      volumeId: cid,
      volumeLabel: getLightNovelVolumeLabel(volume) || getLightNovelVolumeTitle(volume),
      chapterTitle: entry.current_chapter_title,
      percentage: entry.percentage,
    }
  })
  const continueOpen = ref(false)
  const pickerTitle = computed(() => `将「${props.title}」加入收藏夹`)
  const router = useRouter()

  const rateCtl = useLightNovelRate(props.lightNovelId, props.myRate)

  const statusOptions: WorkStatusOption[] = LIGHT_NOVEL_STATUS_ORDER.map(value => ({
    value,
    label: LIGHT_NOVEL_STATUS_LABEL[value],
    sub: LIGHT_NOVEL_STATUS_SUB[value],
    icon: STATUS_ICON[value],
  }))

  const dialogOpen = ref(false)
  const rateMode = computed<'chip' | 'prompt' | 'hidden'>(() => {
    if (rateCtl.status.value === 'PLAN') return 'hidden'
    if (rateCtl.score.value != null) return 'chip'
    if (rateCtl.status.value != null) return 'prompt'
    return 'hidden'
  })

  function compareVolumes(
    left: LightNovelPageData['volumes'][number],
    right: LightNovelPageData['volumes'][number],
  ) {
    return (
      dateValue(left.publication_date) - dateValue(right.publication_date) ||
      numberValue(left.volume_number) - numberValue(right.volume_number) ||
      left.id - right.id
    )
  }

  function dateValue(value: string | Date | null | undefined) {
    if (value instanceof Date) return value.getTime()
    if (typeof value !== 'string' || !value) return Number.POSITIVE_INFINITY
    const parsed = Date.parse(value)
    return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY
  }

  function numberValue(value: number | null | undefined) {
    return value ?? Number.POSITIVE_INFINITY
  }

  function readStart() {
    if (!startTarget.value) return
    void router.push(`/light-novel-volumes/${startTarget.value.id}/read`)
  }
</script>

<template>
  <div class="flex flex-wrap items-stretch justify-center gap-3 lg:justify-start">
    <Button v-if="continueInfo" label="继续阅读" @click="continueOpen = true">
      <template #icon>
        <Play :size="17" aria-hidden="true" />
      </template>
    </Button>
    <Button v-else-if="canRead && startTarget" login-required label="开始阅读" @click="readStart">
      <template #icon>
        <Play :size="17" aria-hidden="true" />
      </template>
    </Button>
    <Button v-else disabled label="开始阅读">
      <template #icon>
        <Play :size="17" aria-hidden="true" />
      </template>
    </Button>

    <WorkStatusMenu
      tone="secondary"
      :status="rateCtl.status.value"
      :status-private="rateCtl.statusPrivate.value"
      :options="statusOptions"
      :busy="rateCtl.pending.value"
      @select="(value, priv) => rateCtl.setStatus(value as LightNovelRateStatus, priv)"
      @clear="rateCtl.remove"
      @privacy="rateCtl.setPrivacy"
    />

    <Button v-if="rateMode === 'chip'" severity="secondary" outlined @click="dialogOpen = true">
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
      label="写个评分"
      icon-pos="right"
      outlined
      @click="dialogOpen = true"
    >
      <template #icon><ArrowRight class="size-3.5" /></template>
    </Button>

    <FavoriteToggle
      :id="lightNovelId"
      type="light_novel"
      :initial-favorited="favorited"
      variant="icon"
      :picker-title="pickerTitle"
    />
    <ShareButton
      :to="`/light-novels/${lightNovelId}`"
      tooltip="分享"
      severity="secondary"
      outlined
    />

    <LightNovelRateDialog
      v-model:visible="dialogOpen"
      :light-novel-id="lightNovelId"
      :rate="rateCtl.rate.value"
      :work-title="title"
      :upsert="rateCtl.upsert"
      :remove="rateCtl.remove"
    />

    <LightNovelHeroContinueDialog
      v-if="continueInfo"
      v-model:visible="continueOpen"
      :work-title="title"
      :volume-id="continueInfo.volumeId"
      :volume-label="continueInfo.volumeLabel"
      :chapter-title="continueInfo.chapterTitle"
      :percentage="continueInfo.percentage"
    />
  </div>
</template>
