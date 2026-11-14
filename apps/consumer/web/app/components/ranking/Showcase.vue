<script setup lang="ts">
  import { Heading, Inline, Stack } from '@hina-ui/vue'
  import { rankingRoute, type RankingMedium } from '~/features/ranking/ranking'

  defineOptions({ name: 'RankingShowcase' })
  defineProps<{ medium: RankingMedium }>()
</script>

<template>
  <Stack as="section" gap="md" class="min-w-0">
    <Inline gap="md" align="end" justify="between" :wrap="false">
      <Heading :level="2" class="w-(--ranking-logo-sm) max-w-full min-w-0">
        <RankingLogo :medium="medium" period="week" />
      </Heading>
      <ViewAllLink :to="rankingRoute(medium, 'week')">完整榜单</ViewAllLink>
    </Inline>
    <Stack gap="none" class="gap-3">
      <slot />
    </Stack>
  </Stack>
</template>
