<script setup lang="ts">
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
  <ol class="flex flex-col gap-1">
    <li v-for="entry in items" :key="entry.href">
      <Button
        :severity="isActive(entry) ? 'primary' : 'secondary'"
        variant="text"
        class="w-full justify-start! text-left!"
        :class="isActive(entry) ? 'bg-primary/10!' : ''"
        @click="emit('select', entry)"
      >
        <span class="line-clamp-2" :style="{ paddingLeft: `${level * 14}px` }">
          {{ entry.label }}
        </span>
      </Button>
      <HikariReaderCatalogTableOfContents
        v-if="entry.children.length"
        :items="entry.children"
        :active-href="activeHref"
        :level="level + 1"
        @select="emit('select', $event)"
      />
    </li>
  </ol>
</template>
