<script setup lang="ts">
  import { Flex, Heading, IconButton, Inline, Tag, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { ChevronLeft } from '@lucide/vue'

  defineProps<{ back: string; title: string; subtitle?: string | null; kind: string }>()
</script>

<template>
  <Inline
    as="header"
    gap="sm"
    align="center"
    :wrap="false"
    class="h-12 shrink-0 border-b border-line bg-surface pr-3 pl-2 lg:gap-3"
  >
    <IconButton :as="NuxtLink" :to="back" label="返回我的投稿" variant="ghost" tone="neutral">
      <ChevronLeft />
    </IconButton>
    <Flex direction="col" class="min-w-0 flex-1 lg:flex-row lg:items-baseline lg:gap-2">
      <Heading :level="1" size="sm" class="min-w-0 truncate">{{ title }}</Heading>
      <Text v-if="subtitle" size="sm" tone="muted" truncate class="min-w-0 max-lg:text-xs">
        {{ subtitle }}
      </Text>
      <Tag size="sm" variant="soft" tone="neutral" class="shrink-0 max-lg:hidden">{{ kind }}</Tag>
    </Flex>
    <Inline gap="md" align="center" :wrap="false" class="shrink-0 max-md:gap-1">
      <Inline gap="md" align="center" :wrap="false" class="max-lg:hidden">
        <slot name="status" />
      </Inline>
      <slot />
    </Inline>
  </Inline>
</template>
