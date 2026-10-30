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
  import { CREDIT_ROLE_LABELS, creditRoleLabel } from '~/features/entry/labels'

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
  <Stack gap="sm" class="border-t border-line pt-5">
    <Heading :level="4" size="sm">制作信息</Heading>
    <DescriptionList orientation="horizontal" class="text-sm">
      <template v-for="[code, items] in groups" :key="code">
        <DescriptionTerm>{{ creditRoleLabel(code) }}</DescriptionTerm>
        <DescriptionDetails>
          <Inline gap="none" wrap class="gap-x-3 gap-y-1">
            <GalgameCrewName v-for="(credit, index) in items" :key="index" :credit="credit" />
          </Inline>
        </DescriptionDetails>
      </template>
    </DescriptionList>
  </Stack>
</template>
