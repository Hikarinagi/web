<script setup lang="ts">
  import { Card, Inline, Text } from '@hina-ui/vue'
  import { LoaderCircle } from '@lucide/vue'
  import type { NotivueItem } from 'notivue'

  defineOptions({ name: 'NotificationsCheckInLoadingToast' })

  defineProps<{ item: NotivueItem }>()
</script>

<template>
  <Card :padded="false" class="hn-scrollbar-safe min-w-72 p-3 shadow-lg">
    <Inline gap="none" align="center" :wrap="false" class="gap-2.5">
      <LoaderCircle class="size-4 shrink-0 animate-spin text-muted" aria-hidden="true" />
      <Text as="p" size="sm">{{ item.message }}</Text>
    </Inline>
  </Card>
</template>
