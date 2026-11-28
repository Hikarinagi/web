<script setup lang="ts">
  import { Center } from '@hina-ui/vue'
  import { Gift } from '@lucide/vue'
  import type { BackendLotteryPrize } from '~/features/lottery/lottery'

  defineProps<{ prize: BackendLotteryPrize }>()
</script>

<template>
  <Center class="shrink-0 overflow-hidden rounded-lg bg-subtle">
    <HikariImage
      v-if="prize.image"
      :src="prize.image.src"
      :alt="prize.name"
      :preview="false"
      class="size-full"
      image-class="size-full object-cover"
      preset="small"
    />
    <HikariImage
      v-else-if="prize.decoration"
      :src="prize.decoration.image.src"
      :alt="prize.name"
      :preview="false"
      :skeleton="false"
      class="size-full"
      image-class="size-full object-contain"
      preset="small"
    />
    <HikariPoint v-else-if="prize.kind === 'POINTS'" class="size-8" />
    <Gift v-else class="size-6 text-muted" />
  </Center>
</template>
