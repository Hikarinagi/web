<script setup lang="ts">
  import {
    DescriptionDetails,
    DescriptionList,
    DescriptionTerm,
    Heading,
    Inline,
    Stack,
  } from '@hina-ui/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { CREDIT_ROLE_LABELS, creditGroupLabel, sharedSongKind } from '~/features/entry/labels'

  defineOptions({ name: 'GalgameProductsCredits' })
  const props = defineProps<{
    credits: ApiData<'/api/v3/products/{id}', 'get'>['credits']
  }>()

  const groups = computed(() => {
    const order = Object.keys(CREDIT_ROLE_LABELS)
    const map = new Map<string, typeof props.credits>()
    for (const credit of props.credits)
      map.set(credit.code, [...(map.get(credit.code) ?? []), credit])
    return [...map].sort(([a], [b]) => order.indexOf(a) - order.indexOf(b))
  })
</script>

<template>
  <Stack gap="sm">
    <Heading :level="4" size="sm">制作信息</Heading>
    <DescriptionList
      orientation="horizontal"
      class="gap-x-4 gap-y-2 text-sm [&_dd]:text-fg [&_dt]:w-20 [&_dt]:font-normal [&_dt]:text-muted"
    >
      <template v-for="[code, items] in groups" :key="code">
        <DescriptionTerm>{{ creditGroupLabel(code, items) }}</DescriptionTerm>
        <DescriptionDetails>
          <Inline gap="none" class="gap-x-3">
            <GalgameCrewName
              v-for="(credit, index) in items"
              :key="index"
              :credit="credit"
              :plain="Boolean(sharedSongKind(items))"
            />
          </Inline>
        </DescriptionDetails>
      </template>
    </DescriptionList>
  </Stack>
</template>
