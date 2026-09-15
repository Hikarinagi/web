<script setup lang="ts">
  import { AspectRatio, Flex } from '@hina-ui/vue'

  defineProps<{
    src: string | null | undefined
  }>()
</script>

<template>
  <AspectRatio :ratio="16 / 5" class="relative w-full overflow-hidden">
    <HikariImage
      :src="src ?? ''"
      alt=""
      preset="medium"
      class="size-full"
      image-class="size-full object-cover"
    >
      <template #empty>
        <Flex as="span" class="absolute inset-0 bg-linear-to-br from-accent-soft to-accent" />
      </template>
      <template #error>
        <Flex as="span" class="absolute inset-0 bg-linear-to-br from-accent-soft to-accent" />
      </template>
    </HikariImage>
  </AspectRatio>
</template>
