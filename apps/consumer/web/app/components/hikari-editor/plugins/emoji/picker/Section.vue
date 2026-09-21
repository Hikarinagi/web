<script setup lang="ts">
  import { Heading, Stack } from '@hina-ui/vue'

  defineOptions({ name: 'HikariEditorPluginsEmojiPickerSection' })

  defineProps<{
    id: string
    title: string
  }>()
</script>

<template>
  <Stack as="section" :data-section-id="id" gap="none">
    <Heading
      :level="3"
      size="xs"
      weight="medium"
      class="sticky top-0 z-10 bg-surface/95 px-2 py-1.5 text-muted backdrop-blur"
    >
      {{ title }}
    </Heading>
    <slot />
  </Stack>
</template>
