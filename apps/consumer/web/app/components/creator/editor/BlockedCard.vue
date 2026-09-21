<script setup lang="ts">
  import { Button, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { CircleDotDashed } from '@lucide/vue'

  defineProps<{ changeRequestId: number }>()
</script>

<template>
  <Stack gap="sm" align="center" class="py-8 text-center">
    <Text size="sm" tone="muted">此条目已有一个进行中的变更请求，合并或关闭后才能再次编辑。</Text>
    <Button
      :as="NuxtLink"
      :to="`/create/contributions/${changeRequestId}`"
      variant="ghost"
      tone="neutral"
      size="sm"
    >
      <template #icon><CircleDotDashed /></template>
      查看进行中的变更请求
    </Button>
  </Stack>
</template>
