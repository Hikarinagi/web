<script setup lang="ts">
  import { Heading, Inline, Stack } from '@hina-ui/vue'

  defineOptions({ name: 'GalgameExploreSection' })
  defineProps<{
    title: string
    to?: string
  }>()
</script>

<template>
  <Stack as="section" gap="none" class="gap-4">
    <Inline gap="none" align="baseline" :wrap="false" class="gap-3">
      <Heading :level="2" size="2xl">{{ title }}</Heading>
      <ViewAllLink v-if="to" :to="to" class="ms-auto" />
    </Inline>
    <slot />
  </Stack>
</template>
