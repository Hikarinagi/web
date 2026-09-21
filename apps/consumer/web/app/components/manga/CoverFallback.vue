<script setup lang="ts">
  import { Stack, Text } from '@hina-ui/vue'

  defineOptions({ name: 'MangaCoverFallback' })
  defineProps<{ title: string }>()
</script>

<template>
  <Stack
    as="span"
    gap="none"
    align="center"
    justify="center"
    class="absolute inset-0 gap-2 bg-subtle px-4 text-center"
  >
    <Text as="span" size="sm" weight="semibold" tone="muted" class="line-clamp-3">
      {{ title }}
    </Text>
    <Text as="span" size="xs" tone="faint">暂无封面</Text>
  </Stack>
</template>
