<script setup lang="ts">
  import { Button, Heading, Inline, Stack } from '@hina-ui/vue'
  import { NuxtLink } from '#components'

  defineOptions({ name: 'DevelopersConsoleShellPage' })
  definePageMeta({ middleware: 'auth' })
</script>

<template>
  <Stack gap="lg" class="py-8">
    <Inline gap="md" align="end" justify="between" wrap>
      <Heading :level="1" size="2xl">开发者控制台</Heading>
      <Button :as="NuxtLink" to="/developers/guide" variant="outline" tone="neutral">
        API 文档
      </Button>
    </Inline>
    <NuxtPage />
  </Stack>
</template>
