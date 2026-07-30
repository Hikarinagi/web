<script setup lang="ts">
  import type { UserCardData } from './composables/useUserCard'

  defineProps<{
    user: UserCardData
  }>()
</script>

<template>
  <div
    v-if="user.signature || user.bio"
    class="mt-1.5 line-clamp-3 text-[13px] leading-relaxed text-muted-color"
  >
    {{ user.signature || user.bio }}
  </div>
</template>
