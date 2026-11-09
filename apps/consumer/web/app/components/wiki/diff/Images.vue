<script setup lang="ts">
  import { Text } from '@hina-ui/vue'
  import type { ComparedStatement } from '~/features/wiki/values'

  defineOptions({ name: 'WikiDiffImages' })

  defineProps<{ before: ComparedStatement['media']; after: ComparedStatement['media'] }>()
</script>

<template>
  <HikariImageGroup class="flex-row items-center gap-2">
    <HikariImage
      v-if="before"
      :src="before"
      alt="修改前的图片"
      preset="small"
      preview
      class="size-16 overflow-hidden rounded-sm opacity-60 ring-2 ring-danger"
      image-class="size-full object-cover"
    />
    <Text v-if="before && after" as="span" size="sm" tone="muted">→</Text>
    <HikariImage
      v-if="after"
      :src="after"
      alt="修改后的图片"
      preset="small"
      preview
      class="size-16 overflow-hidden rounded-sm ring-2 ring-success"
      image-class="size-full object-cover"
    />
  </HikariImageGroup>
</template>
