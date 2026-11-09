<script setup lang="ts">
  import { Inline, Link, Stack, Text } from '@hina-ui/vue'
  import { Star } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { KnownItem } from '~/features/person/works'

  defineOptions({ name: 'PersonKnown' })
  defineProps<{ items: KnownItem[] }>()
</script>

<template>
  <Stack v-if="items.length" gap="sm" class="min-w-0">
    <Text size="sm" weight="medium" tone="muted">代表作</Text>
    <ScrollRail class="-mx-4 lg:-mx-2">
      <Inline gap="md" align="start" :wrap="false" class="w-max px-4 py-1 lg:px-2">
        <Stack v-for="item in items" :key="item.key" gap="xs" class="w-28 shrink-0 lg:w-32">
          <NuxtLink :to="item.to" class="block hn-interactive rounded-md" :aria-label="item.title">
            <EntryBookCover v-if="item.book" :media="item.image" :alt="item.title" />
            <HikariImage
              v-else
              :src="item.image"
              :alt="item.title"
              :ratio="7 / 10"
              :processing="{ width: 320, quality: 80, fit: 'cover', format: 'auto' }"
              :image-class="item.portrait ? 'object-cover object-top' : 'object-cover'"
              class="w-full overflow-hidden rounded-md bg-white shadow-md ring-1 ring-black/5"
            />
          </NuxtLink>
          <Link
            :as="NuxtLink"
            :to="item.to"
            tone="neutral"
            class="line-clamp-2 text-sm leading-snug font-medium"
            lang="ja"
          >
            {{ item.title }}
          </Link>
          <Text size="xs" tone="muted" class="line-clamp-2">{{ item.sub }}</Text>
          <Inline gap="xs" align="center" :wrap="false" class="text-xs text-muted tabular-nums">
            <Text as="span" size="xs" tone="muted">{{ item.year }}</Text>
            <template v-if="item.rating.average !== null">
              <Star class="ml-1 size-3 fill-current text-warning" />
              <Text as="span" size="xs">{{ item.rating.average.toFixed(1) }}</Text>
            </template>
          </Inline>
        </Stack>
      </Inline>
    </ScrollRail>
  </Stack>
</template>
