<script setup lang="ts">
  import type { DownloadFormat } from '~/features/download/types'
  import { useDownloadDialog } from '~/features/download/useDownloadDialog'
  import { useSelection } from '~/features/download/useSelection'

  defineOptions({ name: 'LightNovelVolumeDownloadAction' })

  const props = defineProps<{
    seriesId: number
    title: string
    volumes: { id: number; label: string }[]
  }>()
  const format = ref<DownloadFormat>('EPUB')
  const flow = useDownloadDialog({ kind: 'NOVEL', seriesId: () => props.seriesId, format })
  watch(
    () => props.volumes,
    value => {
      flow.selected.value = value.map(volume => volume.id)
    },
    { immediate: true },
  )
  const selection = useSelection(() => props.volumes, flow.selected)
  const locked = computed(() => flow.creating.value || !!flow.run.value)
</script>

<template>
  <DownloadTrigger
    v-if="volumes.length"
    :loading="flow.creating.value"
    @click="flow.open.value = true"
  />
  <DownloadDialog :flow="flow" :title="title" unit="卷">
    <template v-if="volumes.length > 1" #default>
      <DownloadSelection
        v-model="flow.selected.value"
        :selection="selection"
        unit="卷"
        :disabled="locked"
      />
    </template>
  </DownloadDialog>
</template>
