<script setup lang="ts">
  import { SquarePen } from '@lucide/vue'
  import { getRevisionEditPath, type WorkResourceSlug } from '~/features/revision/resources'

  const props = defineProps<{
    resourceType: WorkResourceSlug
    resourceId: number
  }>()

  const to = computed(() => getRevisionEditPath(props.resourceType, props.resourceId))
</script>

<template>
  <Button
    v-tooltip.bottom="'修订此条目'"
    as="router-link"
    :to="to"
    target="_blank"
    aria-label="修订此条目"
    severity="secondary"
    outlined
  >
    <template #icon>
      <SquarePen class="size-4" />
    </template>
  </Button>
</template>
