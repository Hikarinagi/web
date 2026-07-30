<script setup lang="ts">
  import { ArrowRight, Pencil, Play, Star } from '@lucide/vue'
  import type { LightNovelVolumePageData } from '~~/server/api/pages/light-novel-volumes/[id].get'
  import { getLightNovelVolumeTitle } from '~/utils/media/light-novel'
  import { useLightNovelVolumeRate } from '~/features/light-novel-volume/useLightNovelVolumeRate'
  import type { LightNovelVolumeRate } from '~/features/light-novel-volume/rate'

  defineOptions({ name: 'LightNovelVolumeHeroCta' })
  const props = defineProps<{
    volume: LightNovelVolumePageData['volume']
    progress: LightNovelVolumePageData['progress']
    myRate: LightNovelVolumeRate | null
  }>()

  const resume = computed(() => (props.progress?.percentage ?? 0) > 0)
  const volumeTitle = computed(() => getLightNovelVolumeTitle(props.volume))
  const router = useRouter()

  const rateCtl = useLightNovelVolumeRate(props.volume.id, props.myRate)
  const dialogOpen = ref(false)

  function read() {
    void router.push(`/light-novel-volumes/${props.volume.id}/read`)
  }
</script>

<template>
  <div class="flex flex-wrap items-stretch justify-center gap-2.5 lg:justify-start">
    <Button
      v-if="volume.online_reading_available"
      login-required
      :label="resume ? '继续阅读' : '开始阅读'"
      @click="read"
    >
      <template #icon>
        <Play :size="17" aria-hidden="true" />
      </template>
    </Button>
    <Button v-else disabled label="暂无在线阅读">
      <template #icon>
        <Play :size="17" aria-hidden="true" />
      </template>
    </Button>

    <Button
      v-if="rateCtl.score.value != null"
      severity="secondary"
      outlined
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
      v-else
      login-required
      severity="secondary"
      label="写个评分"
      icon-pos="right"
      outlined
      @click="dialogOpen = true"
    >
      <template #icon><ArrowRight class="size-3.5" /></template>
    </Button>

    <ShareButton
      :to="`/light-novel-volumes/${volume.id}`"
      tooltip="分享"
      severity="secondary"
      outlined
    />

    <LightNovelVolumeEpubActions
      :volume-id="volume.id"
      :available="volume.online_reading_available"
    />

    <LightNovelVolumeRateDialog
      v-model:visible="dialogOpen"
      :rate="rateCtl.rate.value"
      :volume-title="volumeTitle"
      :upsert="rateCtl.upsert"
      :remove="rateCtl.remove"
    />
  </div>
</template>
