<script setup lang="ts">
  import { LoaderCircle } from '@lucide/vue'
  import type { NotivueItem } from 'notivue'

  defineOptions({ name: 'NotificationsCheckInLoadingToast' })

  defineProps<{ item: NotivueItem }>()
</script>

<template>
  <div
    class="mr-(--p-scrollbar-width) flex min-w-72 items-center gap-2.5 rounded-md border border-surface bg-surface-0 p-3 shadow-lg dark:bg-surface-900"
  >
    <LoaderCircle class="size-4 shrink-0 animate-spin text-muted-color" aria-hidden="true" />
    <p class="text-sm text-color">{{ item.message }}</p>
  </div>
</template>
