<script setup lang="ts">
  import {
    Button as HnButton,
    DescriptionDetails,
    DescriptionList,
    DescriptionTerm,
    Link,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'
  import { platformLabel } from '~/features/galgame/platforms'

  defineOptions({ name: 'GalgameFacts' })
  const props = defineProps<{
    data: GalgamePageData
    website?: string
    languages: string[]
  }>()

  const values = (property: string) =>
    props.data.facts.find(fact => fact.property === property)?.values ?? []
  const publishers = computed(() => {
    const seen = new Map<string, { text: string; producer_id: number | null }>()
    for (const product of props.data.products)
      for (const credit of product.publishers) seen.set(credit.text, credit)
    return [...seen.values()]
  })
  const genre = computed(() => values('GENRE_TEXT')[0]?.text ?? props.data.galgame.adv_type)
  const aliases = computed(() => values('ALIAS').map(value => value.text))
  const allAliases = ref(false)
  const shownAliases = computed(() =>
    allAliases.value ? aliases.value : aliases.value.slice(0, 3),
  )
  const host = computed(() => props.website?.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''))
</script>

<template>
  <DescriptionList
    orientation="horizontal"
    class="gap-x-4 gap-y-2 text-sm [&_dd]:text-fg [&_dt]:text-muted"
  >
    <template v-if="data.display.brands.length">
      <DescriptionTerm>开发</DescriptionTerm>
      <DescriptionDetails>
        <Stack gap="none">
          <template v-for="brand in data.display.brands" :key="brand.text">
            <Link
              v-if="brand.producer_id"
              :as="NuxtLink"
              :to="`/producers/${brand.producer_id}`"
              tone="neutral"
              class="self-start"
              lang="ja"
            >
              {{ brand.text }}
            </Link>
            <Text v-else as="span" size="sm" lang="ja">{{ brand.text }}</Text>
          </template>
        </Stack>
      </DescriptionDetails>
    </template>
    <template v-if="publishers.length">
      <DescriptionTerm>发行</DescriptionTerm>
      <DescriptionDetails>
        <Stack gap="none">
          <template v-for="publisher in publishers" :key="publisher.text">
            <Link
              v-if="publisher.producer_id"
              :as="NuxtLink"
              :to="`/producers/${publisher.producer_id}`"
              tone="neutral"
              class="self-start"
              lang="ja"
            >
              {{ publisher.text }}
            </Link>
            <Text v-else as="span" size="sm" lang="ja">{{ publisher.text }}</Text>
          </template>
        </Stack>
      </DescriptionDetails>
    </template>
    <template v-if="data.display.release?.text">
      <DescriptionTerm>首发</DescriptionTerm>
      <DescriptionDetails class="tabular-nums">{{ data.display.release?.text }}</DescriptionDetails>
    </template>
    <template v-if="genre">
      <DescriptionTerm>类型</DescriptionTerm>
      <DescriptionDetails lang="ja">{{ genre }}</DescriptionDetails>
    </template>
    <template v-if="data.display.platforms.length">
      <DescriptionTerm>平台</DescriptionTerm>
      <DescriptionDetails>
        <Stack gap="none">
          <Text v-for="code in data.display.platforms" :key="code" as="span" size="sm">
            {{ platformLabel(code) }}
          </Text>
        </Stack>
      </DescriptionDetails>
    </template>
    <template v-if="languages.length">
      <DescriptionTerm>语言</DescriptionTerm>
      <DescriptionDetails>{{ languages.join('、') }}</DescriptionDetails>
    </template>
    <template v-if="website">
      <DescriptionTerm>官网</DescriptionTerm>
      <DescriptionDetails class="min-w-0">
        <Link
          as="a"
          :href="website"
          target="_blank"
          rel="noopener noreferrer"
          tone="neutral"
          class="block truncate"
        >
          {{ host }}
        </Link>
      </DescriptionDetails>
    </template>
    <template v-if="aliases.length">
      <DescriptionTerm>别名</DescriptionTerm>
      <DescriptionDetails class="wrap-anywhere">
        <Stack gap="none">
          <Text v-for="alias in shownAliases" :key="alias" as="span" size="sm">{{ alias }}</Text>
          <HnButton
            v-if="aliases.length > 3"
            variant="link"
            size="sm"
            class="self-start"
            @click="allAliases = !allAliases"
          >
            {{ allAliases ? '收起' : `另有 ${aliases.length - 3} 个` }}
          </HnButton>
        </Stack>
      </DescriptionDetails>
    </template>
  </DescriptionList>
</template>
