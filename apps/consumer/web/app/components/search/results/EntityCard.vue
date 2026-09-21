<script setup lang="ts">
  import { Stack, Text } from '@hina-ui/vue'
  import { ENTITY_FALLBACK_IMAGE } from '~/features/entity/entity'
  import { entityHref, type SearchHit } from '~/features/search/search'

  defineProps<{ hit: SearchHit }>()
</script>

<template>
  <NuxtLink
    :to="entityHref(hit)"
    class="group flex w-full hn-interactive flex-col items-center gap-2 text-center hn-press-none"
  >
    <HikariImage
      :src="hit.cover"
      :alt="hit.title"
      class="size-20 rounded-full border border-line bg-subtle"
      image-class="object-cover object-top"
      preset="avatar"
      :fallback-src="ENTITY_FALLBACK_IMAGE"
    />
    <Stack gap="none" class="w-full gap-0.5">
      <Text
        as="span"
        size="sm"
        weight="medium"
        truncate
        class="hn-transition group-hover:text-accent-text"
      >
        {{ hit.title }}
      </Text>
      <Text v-if="hit.subtitle" as="span" size="xs" tone="muted" truncate>
        {{ hit.subtitle }}
      </Text>
    </Stack>
  </NuxtLink>
</template>
