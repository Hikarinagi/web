<script setup lang="ts">
  import {
    DescriptionDetails,
    DescriptionList,
    DescriptionTerm,
    Link,
    Panel,
    Text,
  } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { GalgameEditPageData } from '~~/server/api/pages/create/edit/galgame/[id].get'
  import { ageRatingLabel, releaseStatusLabel } from '~/features/entry/labels'
  import { langLabel } from '~/features/galgame/labels'
  import { platformLabel, sortPlatforms } from '~/features/galgame/platforms'

  defineOptions({ name: 'CreatorEntryProductsRelease' })
  const props = defineProps<{
    products: GalgameEditPageData['products']
    facts: GalgameEditPageData['facts']
    display: GalgameEditPageData['display']
  }>()

  const RATINGS = ['ALL_AGES', 'R15', 'R18']
  const rating = computed(
    () =>
      props.products
        .flatMap(item => (item.age_rating ? [item.age_rating] : []))
        .sort((a, b) => RATINGS.indexOf(b) - RATINGS.indexOf(a))[0] ?? null,
  )
  const rows = computed(() =>
    [
      { label: '发售日', text: props.display.release?.text ?? '未知' },
      {
        label: '运行平台',
        text: sortPlatforms([...new Set(props.products.flatMap(item => item.platforms))])
          .map(platformLabel)
          .join('、'),
      },
      {
        label: '语言',
        text: (props.facts.find(item => item.property === 'LANGUAGE')?.values ?? [])
          .map(value => langLabel(value.code ?? value.text))
          .join('、'),
      },
      { label: '年龄分级', text: ageRatingLabel(rating.value) },
      {
        label: '发售状态',
        text: releaseStatusLabel(props.products.find(item => item.release)?.release_status ?? null),
      },
    ].filter(row => row.text),
  )
  const brands = computed(() =>
    [
      { label: '开发', items: props.display.brands.filter(item => item.code === 'DEVELOPER') },
      { label: '发行', items: props.display.brands.filter(item => item.code === 'PUBLISHER') },
    ].filter(row => row.items.length),
  )
</script>

<template>
  <Panel title="发售信息">
    <template #title>
      发售信息
      <CreatorEntryHint name="release" class="ms-1 align-middle" />
    </template>
    <DescriptionList orientation="horizontal" class="text-sm [--hn-dl-term-width:--spacing(24)]">
      <template v-for="row in rows" :key="row.label">
        <DescriptionTerm>{{ row.label }}</DescriptionTerm>
        <DescriptionDetails>{{ row.text }}</DescriptionDetails>
      </template>
      <template v-for="row in brands" :key="row.label">
        <DescriptionTerm>{{ row.label }}</DescriptionTerm>
        <DescriptionDetails>
          <template v-for="(item, index) in row.items" :key="index">
            <Text v-if="index" as="span" size="sm">、</Text>
            <Link
              v-if="item.producer_id"
              :as="NuxtLink"
              :to="`/producers/${item.producer_id}`"
              tone="accent"
              lang="ja"
            >
              {{ item.text }}
            </Link>
            <Text v-else as="span" size="sm" lang="ja">{{ item.text }}</Text>
          </template>
        </DescriptionDetails>
      </template>
    </DescriptionList>
  </Panel>
</template>
