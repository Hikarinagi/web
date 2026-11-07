<script setup lang="ts">
  import {
    DescriptionDetails,
    DescriptionList,
    DescriptionTerm,
    Heading,
    Link,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { factText } from '~/features/entry/labels'

  defineOptions({ name: 'GalgameProductsFacts' })
  const props = defineProps<{ product: ApiData<'/api/v3/products/{id}', 'get'> }>()

  const SHORT = ['PLATFORM', 'LANGUAGE', 'JAN', 'PRODUCT_CODE'] as const
  const LONG = ['BONUS', 'SPECIFICATION'] as const

  const find = (property: string) =>
    props.product.facts.find(item => item.property === property) ?? null
  const rows = computed(() =>
    SHORT.flatMap(property => {
      const fact = find(property)
      return fact
        ? [
            {
              property,
              label: fact.label,
              text: fact.values.map(value => factText(property, value)).join('、'),
            },
          ]
        : []
    }),
  )
  const notes = computed(() =>
    LONG.flatMap(property => {
      const fact = find(property)
      return fact
        ? [
            {
              property,
              label: fact.label,
              lines: fact.values.map(value => factText(property, value)),
            },
          ]
        : []
    }),
  )
</script>

<template>
  <DescriptionList
    v-if="rows.length || product.games.length > 1"
    orientation="horizontal"
    class="gap-x-4 gap-y-2 text-sm [&_dd]:text-fg [&_dt]:w-20 [&_dt]:font-normal [&_dt]:text-muted"
  >
    <template v-for="row in rows" :key="row.property">
      <DescriptionTerm>{{ row.label }}</DescriptionTerm>
      <DescriptionDetails class="wrap-anywhere tabular-nums">{{ row.text }}</DescriptionDetails>
    </template>
    <template v-if="product.games.length > 1">
      <DescriptionTerm>收录的游戏</DescriptionTerm>
      <DescriptionDetails>
        <Stack gap="none">
          <Link
            v-for="game in product.games"
            :key="game.id"
            :as="NuxtLink"
            :to="`/galgames/${game.id}`"
            tone="neutral"
            class="self-start"
          >
            {{ game.title }}
          </Link>
        </Stack>
      </DescriptionDetails>
    </template>
  </DescriptionList>

  <Stack v-for="note in notes" :key="note.property" gap="xs">
    <Heading :level="4" size="sm">{{ note.label }}</Heading>
    <Text
      v-for="(line, index) in note.lines"
      :key="index"
      size="sm"
      tone="muted"
      class="leading-relaxed wrap-anywhere whitespace-pre-line"
    >
      {{ line }}
    </Text>
  </Stack>
</template>
