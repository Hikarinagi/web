<script setup lang="ts">
  import { entityHref, type SearchHit } from '~/features/search/search'

  defineProps<{ hit: SearchHit }>()
</script>

<template>
  <NuxtLink :to="entityHref(hit)" class="group flex w-full flex-col items-center gap-2 text-center">
    <HikariImage
      :src="hit.cover"
      :alt="hit.title"
      class="size-20 rounded-full border border-surface-200 bg-surface-100 dark:border-surface-800 dark:bg-surface-800"
      image-class="object-cover object-top"
      preset="avatar"
    >
      <template #empty><span /></template>
    </HikariImage>
    <div class="flex w-full flex-col gap-0.5">
      <p
        class="truncate text-sm font-medium text-surface-900 transition-colors group-hover:text-hikari-primary-600 dark:text-surface-100 dark:group-hover:text-hikari-primary-400"
      >
        {{ hit.title }}
      </p>
      <p v-if="hit.subtitle" class="truncate text-xs text-surface-500 dark:text-surface-400">
        {{ hit.subtitle }}
      </p>
    </div>
  </NuxtLink>
</template>
