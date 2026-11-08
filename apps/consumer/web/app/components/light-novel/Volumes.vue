<script setup lang="ts">
  import { Grid } from '@hina-ui/vue'
  import type { LightNovelPageData } from '~~/server/api/pages/light-novels/[id].get'

  const props = defineProps<{
    volumes: LightNovelPageData['volumes']
    progress: LightNovelPageData['progress']
  }>()

  const progressMap = computed(
    () => new Map((props.progress?.progresses ?? []).map(item => [item.volume_id, item])),
  )
  const tracked = computed(() => props.progress != null)
</script>

<template>
  <WorkSection
    v-if="volumes.length"
    id="volumes"
    title="分卷"
    :meta="`全 ${volumes.length} 卷 · 在线阅读`"
    class="scroll-mt-24"
  >
    <Grid :cols="3" class="gap-x-4 gap-y-6 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
      <LightNovelVolumeItem
        v-for="volume in volumes"
        :key="volume.id"
        :volume="volume"
        :progress="progressMap.get(volume.id) ?? null"
        :tracked="tracked"
      />
    </Grid>
  </WorkSection>
</template>
