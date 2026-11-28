<script setup lang="ts">
  import { DescriptionDetails, DescriptionList, DescriptionTerm, Link, Stack } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { MangaVolumePageData } from '~~/server/api/pages/manga-volumes/[id].get'
  import { dateText } from '~/features/entry/date'
  import { creditRoleLabel } from '~/features/entry/labels'
  import { volumePrice } from '~/features/light-novel-volume/price'
  import { getMangaVolumeLabel } from '~/utils/media/manga'

  defineOptions({ name: 'MangaVolumeFacts' })
  const props = defineProps<{
    volume: MangaVolumePageData['volume']
    people: MangaVolumePageData['people']
    producers: MangaVolumePageData['producers']
  }>()

  const { t } = useLocaleText()
  const label = computed(() => getMangaVolumeLabel(props.volume))
  const price = computed(() => volumePrice(props.volume))
  const groups = computed(() => {
    const map = new Map<string, { id: number; name: string }[]>()
    for (const item of props.people) {
      const key = item.note || creditRoleLabel(item.code)
      map.set(key, [...(map.get(key) ?? []), item.person])
    }
    return [...map].map(([key, people]) => ({ key, people }))
  })
  const organizations = computed(() =>
    [
      { key: t('book.facts.publisher'), items: props.volume.publishers },
      { key: t('book.facts.label'), items: props.volume.labels },
    ].filter(group => group.items.length),
  )
  const magazines = computed(() => [
    ...new Map(
      props.producers
        .filter(item => item.code === 'MAGAZINE')
        .map(item => [item.producer.id, item.producer]),
    ).values(),
  ])
</script>

<template>
  <DescriptionList
    orientation="horizontal"
    class="gap-x-4 gap-y-2 text-sm [&_dd]:text-fg [&_dt]:text-muted"
  >
    <DescriptionTerm>系列</DescriptionTerm>
    <DescriptionDetails>
      <Link :as="NuxtLink" :to="`/mangas/${volume.manga.id}`" tone="neutral">
        {{ volume.manga.name_cn || volume.manga.name }}
      </Link>
    </DescriptionDetails>
    <template v-if="label">
      <DescriptionTerm>{{ t('book.facts.volumeNumber') }}</DescriptionTerm>
      <DescriptionDetails class="tabular-nums">{{ label }}</DescriptionDetails>
    </template>
    <template v-if="volume.publication_date">
      <DescriptionTerm>发售日</DescriptionTerm>
      <DescriptionDetails class="tabular-nums">
        {{ dateText(volume.publication_date, volume.publication_date_precision) }}
      </DescriptionDetails>
    </template>
    <template v-if="volume.page_count">
      <DescriptionTerm>页数</DescriptionTerm>
      <DescriptionDetails class="tabular-nums">{{ volume.page_count }} 页</DescriptionDetails>
    </template>
    <template v-if="price">
      <DescriptionTerm>价格</DescriptionTerm>
      <DescriptionDetails class="tabular-nums">{{ price }}</DescriptionDetails>
    </template>
    <template v-if="volume.isbn">
      <DescriptionTerm>ISBN</DescriptionTerm>
      <DescriptionDetails class="tabular-nums">{{ volume.isbn }}</DescriptionDetails>
    </template>
    <template v-for="group in organizations" :key="group.key">
      <DescriptionTerm>{{ group.key }}</DescriptionTerm>
      <DescriptionDetails>
        <Stack gap="none">
          <Link
            v-for="item in group.items"
            :key="item.id"
            :as="NuxtLink"
            :to="`/producers/${item.id}`"
            tone="neutral"
            class="self-start"
            lang="ja"
          >
            {{ item.name }}
          </Link>
        </Stack>
      </DescriptionDetails>
    </template>
    <template v-if="magazines.length">
      <DescriptionTerm>连载</DescriptionTerm>
      <DescriptionDetails>
        <Stack gap="none">
          <Link
            v-for="magazine in magazines"
            :key="magazine.id"
            :as="NuxtLink"
            :to="`/producers/${magazine.id}`"
            tone="neutral"
            class="self-start"
            lang="ja"
          >
            {{ magazine.name }}
          </Link>
        </Stack>
      </DescriptionDetails>
    </template>
    <template v-for="group in groups" :key="group.key">
      <DescriptionTerm>{{ group.key }}</DescriptionTerm>
      <DescriptionDetails>
        <Stack gap="none">
          <Link
            v-for="person in group.people"
            :key="person.id"
            :as="NuxtLink"
            :to="`/people/${person.id}`"
            tone="neutral"
            class="self-start"
            lang="ja"
          >
            {{ person.name }}
          </Link>
        </Stack>
      </DescriptionDetails>
    </template>
  </DescriptionList>
</template>
