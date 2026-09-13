<script setup lang="ts">
  defineProps<{
    src: string | null | undefined
  }>()
</script>

<template>
  <div class="relative aspect-16/5 w-full overflow-hidden">
    <HikariImage
      :src="src ?? ''"
      alt=""
      preset="medium"
      class="size-full"
      image-class="size-full object-cover"
      skeleton-radius="0"
    >
      <template #empty>
        <span class="absolute inset-0 bg-linear-to-br from-primary-200 to-primary-500" />
      </template>
      <template #error>
        <span class="absolute inset-0 bg-linear-to-br from-primary-200 to-primary-500" />
      </template>
    </HikariImage>
  </div>
</template>
