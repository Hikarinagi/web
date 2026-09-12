<script setup lang="ts">
  import { IconButton } from '@hina-ui/vue'
  import { SquarePen } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import { getRevisionEditPath, type WorkResourceSlug } from '~/features/revision/resources'

  const props = defineProps<{
    resourceType: WorkResourceSlug
    resourceId: number
  }>()

  const to = computed(() => getRevisionEditPath(props.resourceType, props.resourceId))
</script>

<template>
  <IconButton
    :as="NuxtLink"
    :to="to"
    target="_blank"
    label="修订此条目"
    side="bottom"
    variant="outline"
  >
    <SquarePen />
  </IconButton>
</template>
