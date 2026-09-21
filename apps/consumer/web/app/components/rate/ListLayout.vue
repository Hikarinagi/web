<script setup lang="ts">
  import { Flex, Stack } from '@hina-ui/vue'

  defineOptions({ name: 'RateListLayout' })
</script>

<template>
  <Flex direction="col" gap="lg" class="items-stretch lg:flex-row lg:items-start">
    <Stack
      as="aside"
      gap="none"
      class="lg:sticky lg:top-[calc(var(--app-header-height)+1.5rem)] lg:w-72 lg:shrink-0"
    >
      <slot name="aside" />
    </Stack>

    <Stack gap="lg" class="min-w-0 flex-1">
      <slot />
    </Stack>
  </Flex>
</template>
