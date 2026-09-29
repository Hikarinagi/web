<script setup lang="ts">
  import { useNovelDownload } from '~/features/light-novel-volume/useNovelDownload'
  import { useSelection } from '~/features/download/useSelection'

  const props = defineProps<{ id: number; title: string; series?: boolean }>()
  const {
    open,
    loading,
    preparing,
    busy,
    status,
    quote,
    quoting,
    selected,
    volumes,
    parts,
    completed,
    finished,
    needsCard,
    prepare,
    download,
    stop,
    reselect,
  } = useNovelDownload(() => props.id, props.series)
  const selection = useSelection(() => volumes.value, selected)
</script>

<template>
  <DownloadTrigger :loading="loading || preparing || busy" @click="prepare" />
  <DownloadDialog
    v-model:open="open"
    :title="title"
    format="EPUB"
    :summary="`已选 ${selected.length} 卷`"
    :status="status"
    :required="selected.length ? (quote?.required_cards ?? null) : 0"
    :quoting="quoting"
    :needs-card="needsCard"
    :busy="busy"
    :disabled="!selected.length || !quote || quoting"
    :resume="!!parts.length"
    :finished="finished"
    @download="download"
    @stop="stop"
    @reselect="reselect"
  >
    <DownloadQueue v-if="parts.length" :parts="parts" :completed="completed" :busy="busy" />
    <DownloadSelection
      v-else
      v-model="selected"
      :selection="selection"
      unit="卷"
      :disabled="busy"
    />
  </DownloadDialog>
</template>
