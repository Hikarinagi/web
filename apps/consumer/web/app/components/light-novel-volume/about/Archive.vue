<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import { CalendarDays, Eye, FileText, Hash, Tag } from '@lucide/vue'
  import type { LightNovelVolumePageData } from '~~/server/api/pages/light-novel-volumes/[id].get'

  defineOptions({ name: 'LightNovelVolumeAboutArchive' })
  const props = defineProps<{
    volume: LightNovelVolumePageData['volume']
    contributors: LightNovelVolumePageData['contributors']
  }>()

  const publicationText = computed(
    () => timeFormat(props.volume.publication_date, TimeFormatEnum.YYYY_MM_DD) || '未收录',
  )
  const priceText = computed(() =>
    props.volume.price_amount != null
      ? [props.volume.price_currency, props.volume.price_amount].filter(Boolean).join(' ')
      : '',
  )
</script>

<template>
  <ResourceArchiveCard>
    <Stack gap="sm" class="px-5 py-3.5">
      <ResourceArchiveRow :icon="CalendarDays">{{ publicationText }}</ResourceArchiveRow>
      <ResourceArchiveRow v-if="volume.pages" :icon="FileText"
        >{{ volume.pages }} 页</ResourceArchiveRow
      >
      <ResourceArchiveRow v-if="priceText" :icon="Tag">{{ priceText }}</ResourceArchiveRow>
      <ResourceArchiveRow v-if="volume.isbn" :icon="Hash">{{ volume.isbn }}</ResourceArchiveRow>
      <ResourceArchiveRow v-if="volume.read_times" :icon="Eye">
        {{ volume.read_times }} 次阅读
      </ResourceArchiveRow>
    </Stack>

    <template #footer>
      <ResourceArchiveContributorFooter
        :contributors="contributors"
        resource-type="light-novel-volume"
        :resource-id="volume.id"
        :updated-at="volume.revised_at ?? volume.created_at"
      />
    </template>
  </ResourceArchiveCard>
</template>
