<script setup lang="ts">
  import { Button, Inline } from '@hina-ui/vue'
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
  <Inline gap="sm" justify="center" class="lg:justify-start">
    <AuthGateButton v-if="volume.online_reading_available" size="lg" @click="read">
      <template #icon>
        <Play aria-hidden="true" />
      </template>
      {{ resume ? '继续阅读' : '开始阅读' }}
    </AuthGateButton>
    <Button v-else size="lg" disabled>
      <template #icon>
        <Play aria-hidden="true" />
      </template>
      暂无在线阅读
    </Button>

    <Button
      v-if="rateCtl.score.value != null"
      size="lg"
      variant="outline"
      tone="neutral"
      @click="dialogOpen = true"
    >
      <template #icon>
        <Star class="fill-amber-400 text-amber-400" />
      </template>
      {{ rateCtl.score.value?.toFixed(1) }}
      <template #trailing>
        <Pencil class="text-muted" />
      </template>
    </Button>
    <AuthGateButton v-else size="lg" variant="outline" tone="neutral" @click="dialogOpen = true">
      写个评分
      <template #trailing><ArrowRight /></template>
    </AuthGateButton>

    <ShareButton :to="`/light-novel-volumes/${volume.id}`" tooltip="分享" size="lg" />

    <LightNovelVolumeEpubActions
      :volume-id="volume.id"
      :available="volume.online_reading_available"
      size="lg"
    />

    <WorkEditButton resource-type="light-novel-volume" :resource-id="volume.id" size="lg" />

    <LightNovelVolumeRateDialog
      v-model:visible="dialogOpen"
      :rate="rateCtl.rate.value"
      :volume-title="volumeTitle"
      :upsert="rateCtl.upsert"
      :remove="rateCtl.remove"
    />
  </Inline>
</template>
