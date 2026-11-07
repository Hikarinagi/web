<script setup lang="ts">
  import { Inline, Link, Stack, Text } from '@hina-ui/vue'
  import { BookImage } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { HikariImageSource } from '~/utils/media/image'

  defineOptions({ name: 'EntryRailWorks' })
  defineProps<{
    title: string
    works: { id: number; title: string; to: string; cover: HikariImageSource; year?: string }[]
  }>()
</script>

<template>
  <Stack v-if="works.length" gap="sm">
    <Text size="sm" tone="muted">{{ title }}</Text>
    <Stack gap="none">
      <Inline
        v-for="work in works"
        :key="work.id"
        gap="sm"
        align="center"
        :wrap="false"
        class="-mx-2 rounded-md px-2 py-1.5 transition-colors duration-(--hn-duration-fast) hover:bg-subtle"
      >
        <HikariImage
          v-if="work.cover"
          :src="work.cover"
          alt=""
          :ratio="7 / 10"
          preset="thumbnail"
          class="w-8 shrink-0 rounded-xs"
        />
        <Stack
          v-else
          gap="none"
          align="center"
          justify="center"
          class="aspect-7/10 w-8 shrink-0 rounded-xs bg-subtle text-faint"
        >
          <BookImage class="size-4" />
        </Stack>
        <Link
          :as="NuxtLink"
          :to="work.to"
          tone="neutral"
          class="min-w-0 flex-1 truncate text-sm"
          lang="ja"
        >
          {{ work.title }}
        </Link>
        <Text v-if="work.year" size="xs" tone="muted" class="tabular-nums">{{ work.year }}</Text>
      </Inline>
    </Stack>
  </Stack>
</template>
