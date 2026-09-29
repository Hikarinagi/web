<script setup lang="ts">
  import { Heading, IconButton, Inline, Tag, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { ChevronLeft } from '@lucide/vue'

  defineProps<{ back: string; title: string; subtitle?: string | null; kind: string }>()
</script>

<template>
  <Inline
    as="header"
    gap="md"
    align="center"
    :wrap="false"
    class="h-12 shrink-0 border-b border-line bg-surface pr-3 pl-2"
  >
    <IconButton :as="NuxtLink" :to="back" label="返回我的投稿" variant="ghost" tone="neutral">
      <ChevronLeft />
    </IconButton>
    <Inline gap="sm" align="baseline" :wrap="false" class="min-w-0">
      <Heading :level="1" size="sm" class="min-w-0 truncate">{{ title }}</Heading>
      <Text v-if="subtitle" size="sm" tone="muted" truncate class="min-w-0">{{ subtitle }}</Text>
      <Tag size="sm" variant="soft" tone="neutral" class="shrink-0 max-lg:hidden">{{ kind }}</Tag>
    </Inline>
    <Inline gap="md" align="center" justify="end" :wrap="false" class="min-w-0 flex-1">
      <slot name="status" />
      <slot />
    </Inline>
  </Inline>
</template>
