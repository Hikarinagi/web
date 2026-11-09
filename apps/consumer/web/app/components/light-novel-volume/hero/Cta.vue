<script setup lang="ts">
  import { Inline } from '@hina-ui/vue'
  import { ArrowRight, BookOpen, BookUp, Pencil, Star } from '@lucide/vue'
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
  const unreleased = computed(() => {
    const date = props.volume.publication_date
    return Boolean(date) && date!.slice(0, 10) > new Date().toISOString().slice(0, 10)
  })
  const volumeTitle = computed(() => getLightNovelVolumeTitle(props.volume))

  const rateCtl = useLightNovelVolumeRate(props.volume.id, props.myRate)
  const dialogOpen = ref(false)
  const contributeOpen = ref(false)

  function read() {
    void navigateTo(`/light-novel-volumes/${props.volume.id}/read`, { open: { target: '_blank' } })
  }
</script>

<template>
  <Inline gap="sm" align="center">
    <Button
      v-if="volume.online_reading_available"
      login-required
      class="w-full sm:w-auto"
      @click="read"
    >
      <template #icon>
        <BookOpen aria-hidden="true" />
      </template>
      {{ resume ? '继续阅读' : '阅读本卷' }}
    </Button>
    <Button v-else-if="unreleased" class="w-full sm:w-auto" disabled>尚未发售</Button>
    <Button v-else login-required class="w-full sm:w-auto" @click="contributeOpen = true">
      <template #icon>
        <BookUp aria-hidden="true" />
      </template>
      投稿
    </Button>

    <Button
      v-if="rateCtl.score.value != null"
      variant="soft"
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
    <Button v-else login-required variant="soft" tone="neutral" @click="dialogOpen = true">
      写个评分
      <template #trailing><ArrowRight /></template>
    </Button>

    <ShareButton :to="`/light-novel-volumes/${volume.id}`" tooltip="分享" size="md" />
    <LightNovelVolumeDownloadAction
      v-if="volume.online_reading_available"
      :series-id="volume.series_id"
      :title="volumeTitle"
      :volumes="[{ id: volume.id, label: volumeTitle }]"
    />

    <LightNovelVolumeEpubActions
      :volume-id="volume.id"
      :available="volume.online_reading_available"
      size="md"
    />

    <WorkEditButton resource-type="light-novel-volume" :resource-id="volume.id" />

    <LightNovelVolumeContributeDialog
      v-if="!volume.online_reading_available"
      v-model:open="contributeOpen"
      :volume-id="volume.id"
    />
    <LightNovelVolumeRateDialog
      v-model:visible="dialogOpen"
      :rate="rateCtl.rate.value"
      :volume-title="volumeTitle"
      :upsert="rateCtl.upsert"
      :remove="rateCtl.remove"
    />
  </Inline>
</template>
