<script setup lang="ts">
  import { entityHref, type SearchHit } from '~/features/search/search'

  const props = defineProps<{ hit: SearchHit }>()

  const createdAt = computed(() =>
    props.hit.created_at ? new Date(props.hit.created_at).toLocaleDateString('zh-CN') : null,
  )
</script>

<template>
  <NuxtLink
    :to="entityHref(hit)"
    class="group flex flex-col gap-1.5 rounded-lg border border-surface p-4 transition-colors hover:bg-emphasis"
  >
    <p
      class="line-clamp-1 text-sm font-medium text-color transition-colors group-hover:text-primary"
    >
      {{ hit.title }}
    </p>
    <p v-if="hit.excerpt" class="line-clamp-2 text-xs text-muted-color">{{ hit.excerpt }}</p>
    <p v-if="hit.author || createdAt" class="flex items-center gap-2 text-xs text-muted-color">
      <span v-if="hit.author" class="truncate">{{ hit.author }}</span>
      <span v-if="createdAt" class="shrink-0">{{ createdAt }}</span>
    </p>
  </NuxtLink>
</template>
