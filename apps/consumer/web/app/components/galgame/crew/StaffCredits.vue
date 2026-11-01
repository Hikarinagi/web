<script setup lang="ts">
  import { DescriptionDetails, DescriptionList, DescriptionTerm, Flex } from '@hina-ui/vue'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'
  import { creditRoleLabel } from '~/features/entry/labels'

  defineOptions({ name: 'GalgameCrewStaffCredits' })
  defineProps<{ groups: GalgamePageData['credits']['groups'] }>()
</script>

<template>
  <DescriptionList class="divide-y divide-line overflow-hidden rounded-xl border border-line">
    <Flex
      v-for="group in groups"
      :key="group.code"
      direction="col"
      gap="none"
      class="gap-1.5 px-5 py-3 sm:flex-row sm:items-baseline sm:gap-5 sm:py-3.5"
    >
      <DescriptionTerm class="shrink-0 text-xs font-medium text-faint sm:w-24 sm:pt-px">
        {{ creditRoleLabel(group.code) }}
      </DescriptionTerm>
      <DescriptionDetails class="flex min-w-0 flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
        <GalgameCrewName v-for="(credit, index) in group.credits" :key="index" :credit="credit" />
      </DescriptionDetails>
    </Flex>
  </DescriptionList>
</template>
