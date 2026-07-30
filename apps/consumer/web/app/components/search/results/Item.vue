<script setup lang="ts">
  import { entityHref, type SearchHit } from '~/features/search/search'
  import type { WorkCardItem } from '~/features/entity/entity'

  const props = defineProps<{ hit: SearchHit }>()

  const isWork = computed(
    () =>
      props.hit.type === 'galgame' ||
      props.hit.type === 'light_novel' ||
      props.hit.type === 'light_novel_volume' ||
      props.hit.type === 'manga',
  )

  const workItem = computed<WorkCardItem>(() => ({
    to: entityHref(props.hit),
    cover: props.hit.cover,
    title: props.hit.title,
    year: null,
    rolePill: null,
    cvText: props.hit.subtitle,
    aspect:
      props.hit.type === 'galgame'
        ? 'galgame'
        : props.hit.type === 'manga'
          ? 'manga'
          : 'light_novel',
    nsfw: props.hit.cover?.nsfw ?? false,
  }))
</script>

<template>
  <EntityWorkCard v-if="isWork" :item="workItem" />
  <SearchResultsEntityCard v-else :hit="hit" />
</template>
