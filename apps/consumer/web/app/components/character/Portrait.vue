<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import type { HikariImageSource } from '~/utils/media/image'
  import { imageSourceSrc } from '~/utils/media/image'

  defineOptions({ name: 'CharacterPortrait' })
  defineProps<{ image: HikariImageSource; nsfw: boolean; alt: string }>()
</script>

<template>
  <Stack
    gap="none"
    class="relative aspect-5/6 dark:isolate dark:overflow-hidden dark:rounded-xl dark:bg-(--tone-soft) dark:brightness-90"
  >
    <Transition
      enter-active-class="transition-opacity duration-(--hn-duration-base) ease-(--hn-ease-enter)"
      leave-active-class="absolute! inset-0 transition-opacity duration-(--hn-duration-exit) ease-(--hn-ease-exit)"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <HikariImage
        :key="imageSourceSrc(image) ?? ''"
        :src="image"
        :alt="alt"
        :nsfw="nsfw"
        :lazy="false"
        :processing="{ width: 640, quality: 86, format: 'auto' }"
        preview
        class="absolute! inset-0 size-full mix-blend-multiply"
        image-class="object-contain object-bottom"
      />
    </Transition>
  </Stack>
</template>
