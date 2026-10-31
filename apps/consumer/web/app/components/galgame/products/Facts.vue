<script setup lang="ts">
  import { DescriptionDetails, DescriptionList, DescriptionTerm, Text } from '@hina-ui/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import type { BackendFactValue } from '~/features/entry/contract'
  import { factText } from '~/features/entry/labels'

  defineOptions({ name: 'GalgameProductsFacts' })
  const props = defineProps<{ product: ApiData<'/api/v3/products/{id}', 'get'> }>()

  const ORDER = [
    'JAN',
    'PRODUCT_CODE',
    'RELEASE_DATE',
    'RELEASE_STATUS',
    'PRICE',
    'PLATFORM',
    'LANGUAGE',
    'AGE_RATING',
    'ADULT_PATCH',
    'BONUS',
    'SPECIFICATION',
  ] as const
  const LONG = new Set(['BONUS', 'SPECIFICATION'])

  const text = (property: (typeof ORDER)[number], value: BackendFactValue) =>
    property === 'PRICE' && props.product.price?.tax_included != null
      ? `${value.text} ${props.product.price.tax_included ? '含税' : '不含税'}`
      : factText(property, value)
  const rows = computed(() =>
    ORDER.flatMap(property => {
      const fact = props.product.facts.find(item => item.property === property)
      if (!fact) return []
      const lines = fact.values.map(value => text(property, value))
      return [
        { property, label: fact.label, lines: LONG.has(property) ? lines : [lines.join('、')] },
      ]
    }),
  )
</script>

<template>
  <DescriptionList orientation="horizontal" class="text-sm">
    <template v-for="row in rows" :key="row.property">
      <DescriptionTerm>{{ row.label }}</DescriptionTerm>
      <DescriptionDetails v-for="(line, index) in row.lines" :key="index">
        <Text
          as="span"
          :size="LONG.has(row.property) ? 'xs' : 'sm'"
          class="leading-relaxed wrap-anywhere whitespace-pre-line"
        >
          {{ line }}
        </Text>
      </DescriptionDetails>
    </template>
  </DescriptionList>
</template>
