<script setup lang="ts">
  import { Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { GuideNavItem } from '~/features/developer/useGuide'

  defineOptions({ name: 'DeveloperGuideList' })
  defineProps<{ sections: GuideNavItem[] }>()
</script>

<template>
  <Stack gap="none" class="divide-y divide-line">
    <NuxtLink
      v-for="item in sections"
      :key="item.section"
      :to="item.path"
      class="hn-state-layer flex hn-interactive flex-col gap-0.5 rounded-md px-2 py-3 hn-press-none"
    >
      <Text as="span" size="sm" weight="medium">{{ item.title }}</Text>
      <Text as="span" size="sm" tone="muted">{{ item.description }}</Text>
    </NuxtLink>
  </Stack>
</template>
