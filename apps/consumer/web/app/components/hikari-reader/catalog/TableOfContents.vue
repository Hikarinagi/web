<script setup lang="ts">
  import { ListItem, NavLink, Stack, Text } from '@hina-ui/vue'
  import type { TocEntry } from '@ritojs/core'

  const props = withDefaults(
    defineProps<{
      items: readonly TocEntry[]
      activeHref?: string | null
      level?: number
    }>(),
    {
      activeHref: null,
      level: 0,
    },
  )

  const emit = defineEmits<{
    select: [entry: TocEntry]
  }>()

  function isActive(entry: TocEntry) {
    return props.activeHref === entry.href
  }
</script>

<template>
  <Stack as="ol" gap="xs">
    <ListItem v-for="entry in items" :key="entry.href">
      <NavLink
        as="button"
        type="button"
        :active="isActive(entry)"
        class="w-full text-left"
        @click="emit('select', entry)"
      >
        <Text
          as="span"
          size="sm"
          class="line-clamp-2 text-inherit"
          :style="{ paddingLeft: `${level * 14}px` }"
        >
          {{ entry.label }}
        </Text>
      </NavLink>
      <HikariReaderCatalogTableOfContents
        v-if="entry.children.length"
        :items="entry.children"
        :active-href="activeHref"
        :level="level + 1"
        @select="emit('select', $event)"
      />
    </ListItem>
  </Stack>
</template>
