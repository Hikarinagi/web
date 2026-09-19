<script setup lang="ts">
  import { Code, Heading, Inline, Section, Stack, Tag, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { ReferenceEntry } from '~~/server/features/developer/reference'

  defineOptions({ name: 'DeveloperApiGroupList' })
  defineProps<{ group: { tag: string; title: string; entries: ReferenceEntry[] } }>()

  function methodClass(method: string) {
    if (method === 'GET') return 'text-accent-text'
    if (method === 'DELETE') return 'text-danger-text'
    return 'text-warning-text'
  }
</script>

<template>
  <Section :id="group.tag">
    <Inline gap="sm" align="center">
      <Heading :level="2" size="lg">{{ group.title }}</Heading>
      <Text as="span" size="sm" tone="muted" class="tabular-nums">{{ group.entries.length }}</Text>
      <Tag v-if="group.entries[0]?.auth === 'user'" tone="neutral" size="sm">需用户授权</Tag>
    </Inline>

    <Stack gap="none" class="divide-y divide-line">
      <NuxtLink
        v-for="entry in group.entries"
        :key="entry.id"
        :to="`/developers/api/${entry.id}`"
        class="hn-state-layer flex hn-interactive items-baseline gap-3 rounded-md px-2 py-2.5 hn-press-none"
      >
        <Text
          as="span"
          size="xs"
          weight="semibold"
          class="w-14 shrink-0 font-mono"
          :class="methodClass(entry.method)"
        >
          {{ entry.method }}
        </Text>
        <Text as="span" size="sm" weight="medium" class="shrink-0">{{ entry.summary }}</Text>
        <Code class="min-w-0 truncate text-xs text-muted">{{ entry.path }}</Code>
      </NuxtLink>
    </Stack>
  </Section>
</template>
