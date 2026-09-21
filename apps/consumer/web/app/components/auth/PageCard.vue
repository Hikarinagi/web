<script setup lang="ts">
  import { Card, Heading, Stack, Text } from '@hina-ui/vue'
  import logoUrl from '~/assets/images/wordmark.svg'
  import { SITE_CONFIG } from '~/config/site'

  defineProps<{
    subtitle: string
    title: string
  }>()
</script>

<template>
  <Stack
    as="section"
    gap="none"
    justify="center"
    class="mx-auto min-h-[calc(100vh-var(--app-header-height))] w-full max-w-md px-4 py-10"
  >
    <Card class="w-full">
      <Stack gap="sm" class="mb-6">
        <HikariImage
          :src="logoUrl"
          :alt="SITE_CONFIG.name"
          class="aspect-792/191 h-4"
          image-class="object-contain"
          :lazy="false"
          :skeleton="false"
          :preload="{ fetchPriority: 'high' }"
        />
        <Heading :level="1" size="2xl">{{ title }}</Heading>
        <Text as="p" size="sm" tone="muted">{{ subtitle }}</Text>
      </Stack>

      <slot />
    </Card>
  </Stack>
</template>
