<script setup lang="ts">
  import { Inline, Link, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import {
    getRevisionEditPath,
    getRevisionHistoryPath,
    type RevisionResourceSlug,
  } from '~/features/revision/resources'

  const props = defineProps<{
    resourceType: RevisionResourceSlug
    resourceId: number
  }>()

  const historyTo = computed(() => getRevisionHistoryPath(props.resourceType, props.resourceId))
  const editTo = computed(() => getRevisionEditPath(props.resourceType, props.resourceId))
</script>

<template>
  <Inline gap="none" align="center" class="gap-1 text-xs leading-none text-muted">
    <Link :as="NuxtLink" :to="historyTo" tone="neutral">修订历史</Link>
    <Text as="span" size="xs" aria-hidden="true">/</Text>
    <Link :as="NuxtLink" :to="editTo" target="_blank" tone="neutral">修订此条目</Link>
  </Inline>
</template>
