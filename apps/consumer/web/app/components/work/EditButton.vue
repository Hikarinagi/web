<script setup lang="ts">
  import { SquarePen } from '@lucide/vue'

  defineProps<{
    resourceType: 'galgame' | 'light-novel' | 'light-novel-volume'
    resourceId: number
  }>()

  const auth = useAuthStore()
</script>

<template>
  <Button
    v-if="auth.isAuthenticated"
    as="router-link"
    :to="`/create/edit/${resourceType}/${resourceId}`"
    label="编辑此页"
    severity="secondary"
    outlined
    size="small"
    fluid
  >
    <template #icon>
      <SquarePen :size="15" />
    </template>
  </Button>
</template>
