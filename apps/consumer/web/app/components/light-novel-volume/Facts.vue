<script setup lang="ts">
  import { DescriptionDetails, DescriptionList, DescriptionTerm, Link, Stack } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { LightNovelVolumePageData } from '~~/server/api/pages/light-novel-volumes/[id].get'
  import { dayText } from '~/features/entry/date'
  import { volumePrice } from '~/features/light-novel-volume/price'
  import { getLightNovelTitle, getLightNovelVolumeLabel } from '~/utils/media/light-novel'

  defineOptions({ name: 'LightNovelVolumeFacts' })
  const props = defineProps<{
    volume: LightNovelVolumePageData['volume']
    lightNovel: LightNovelVolumePageData['light_novel']
    people: LightNovelVolumePageData['people']
    producers: LightNovelVolumePageData['producers']
  }>()

  const label = computed(() => getLightNovelVolumeLabel(props.volume))
  const price = computed(() => volumePrice(props.volume))
  const groups = computed(() => {
    const map = new Map<string, { id: number; name: string }[]>()
    for (const item of props.people) {
      const key = getLightNovelPersonRelationLabel(item.relation)
      map.set(key, [...(map.get(key) ?? []), item.person])
    }
    return [...map].map(([key, people]) => ({ key, people }))
  })
  const publishers = computed(() => [
    ...new Map(
      props.producers
        .filter(item => item.code !== 'CHINESE_PUBLISHER')
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
      <Link :as="NuxtLink" :to="`/light-novels/${lightNovel.id}`" tone="neutral">
        {{ getLightNovelTitle(lightNovel) }}
      </Link>
    </DescriptionDetails>
    <template v-if="label">
      <DescriptionTerm>卷次</DescriptionTerm>
      <DescriptionDetails class="tabular-nums">{{ label }}</DescriptionDetails>
    </template>
    <template v-if="volume.publication_date">
      <DescriptionTerm>发售日</DescriptionTerm>
      <DescriptionDetails class="tabular-nums">
        {{ dayText(volume.publication_date) }}
      </DescriptionDetails>
    </template>
    <template v-if="volume.pages">
      <DescriptionTerm>页数</DescriptionTerm>
      <DescriptionDetails class="tabular-nums">{{ volume.pages }} 页</DescriptionDetails>
    </template>
    <template v-if="price">
      <DescriptionTerm>价格</DescriptionTerm>
      <DescriptionDetails class="tabular-nums">{{ price }}</DescriptionDetails>
    </template>
    <template v-if="volume.isbn">
      <DescriptionTerm>ISBN</DescriptionTerm>
      <DescriptionDetails class="tabular-nums">{{ volume.isbn }}</DescriptionDetails>
    </template>
    <template v-if="publishers.length">
      <DescriptionTerm>出版社</DescriptionTerm>
      <DescriptionDetails>
        <Stack gap="none">
          <Link
            v-for="publisher in publishers"
            :key="publisher.id"
            :as="NuxtLink"
            :to="`/producers/${publisher.id}`"
            tone="neutral"
            class="self-start"
            lang="ja"
          >
            {{ publisher.name }}
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
    <template v-if="volume.read_times">
      <DescriptionTerm>阅读</DescriptionTerm>
      <DescriptionDetails class="tabular-nums">{{ volume.read_times }} 次</DescriptionDetails>
    </template>
  </DescriptionList>
</template>
