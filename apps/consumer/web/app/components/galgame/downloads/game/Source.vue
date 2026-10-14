<script setup lang="ts">
  import { Avatar, Image, Inline, Link, Text } from '@hina-ui/vue'

  defineOptions({ name: 'GalgameDownloadsGameSource' })
  defineProps<{ url: string | null }>()
</script>

<template>
  <Inline gap="sm">
    <Text as="span" size="sm" tone="muted">来自</Text>
    <Inline
      :as="Link"
      :href="url ?? undefined"
      target="_blank"
      rel="noreferrer"
      tone="neutral"
      gap="sm"
    >
      <Avatar src="/brand/shionlib.png" name="Shionlib" size="sm" />
      <Image
        src="/brand/shionlib-wordmark.svg"
        alt="Shionlib"
        :ratio="5989 / 1038"
        eager
        :lazy="false"
        :skeleton="false"
        :draggable="false"
        fit="contain"
        class="h-4 w-auto select-none"
      />
    </Inline>
  </Inline>
</template>
