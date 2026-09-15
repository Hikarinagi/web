<script setup lang="ts">
  import { Text } from '@hina-ui/vue'
  import type { UserCardData } from './composables/useUserCard'

  defineProps<{
    user: UserCardData
  }>()
</script>

<template>
  <Text
    v-if="user.signature || user.bio"
    size="sm"
    tone="muted"
    class="mt-1.5 line-clamp-3 leading-relaxed"
  >
    {{ user.signature || user.bio }}
  </Text>
</template>
