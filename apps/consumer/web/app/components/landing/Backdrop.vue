<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import { blurUrl } from '~/features/entry/tone'

  defineOptions({ name: 'LandingBackdrop' })
  defineProps<{ hash?: string | null; id: string | number }>()
</script>

<template>
  <Stack
    gap="none"
    aria-hidden="true"
    class="pointer-events-none absolute inset-0 -z-10 overflow-hidden mask-(--stage-fade)"
  >
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-active-class="absolute inset-0 transition-opacity duration-300"
      leave-to-class="opacity-0"
    >
      <Stack
        :key="id"
        gap="none"
        class="absolute -inset-24 scale-110 bg-cover bg-center blur-3xl saturate-150"
        :style="{ backgroundImage: hash ? `url(${blurUrl(hash)})` : undefined }"
      />
    </Transition>
    <Stack gap="none" class="absolute inset-0 bg-canvas/72" />
  </Stack>
</template>
