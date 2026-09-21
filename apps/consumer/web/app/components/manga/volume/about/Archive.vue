<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import { Barcode, BookOpen, Building2, CalendarDays, ListOrdered, Tag } from '@lucide/vue'
  import type { MangaVolumePageData } from '~~/server/api/pages/manga-volumes/[id].get'

  defineOptions({ name: 'MangaVolumeAboutArchive' })
  const props = defineProps<{
    volume: MangaVolumePageData['volume']
    contributors: MangaVolumePageData['contributors']
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
      <ResourceArchiveRow v-if="volume.page_count" :icon="BookOpen">
        {{ volume.page_count }} 页
      </ResourceArchiveRow>
      <ResourceArchiveRow v-if="volume.chapter_count" :icon="ListOrdered">
        收录 {{ volume.chapter_count }} 话
      </ResourceArchiveRow>
      <ResourceArchiveRow v-if="volume.publisher" :icon="Building2">
        {{ volume.publisher }}
      </ResourceArchiveRow>
      <ResourceArchiveRow v-if="priceText" :icon="Tag">{{ priceText }}</ResourceArchiveRow>
      <ResourceArchiveRow v-if="volume.isbn" :icon="Barcode">{{ volume.isbn }}</ResourceArchiveRow>
      <MangaEditionList v-if="volume.editions?.length" :editions="volume.editions" />
    </Stack>

    <template #footer>
      <ResourceArchiveContributorFooter
        :contributors="contributors"
        resource-type="manga-volume"
        :resource-id="volume.id"
        :updated-at="volume.revised_at ?? volume.created_at"
      />
    </template>
  </ResourceArchiveCard>
</template>
