<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import type { HikariImageSource } from '~/utils/media/image'
  import { imageSourceSize, imageSourceSrc } from '~/utils/media/image'

  defineOptions({ name: 'CharacterPortrait' })
  const props = defineProps<{ image: HikariImageSource; nsfw: boolean; alt: string }>()

  const frame = useTemplateRef('frame')
  const { width } = useElementSize(frame)
  const size = computed(() => imageSourceSize(props.image))
  const ratio = computed(() => (size.value ? size.value.width / size.value.height : 5 / 6))
  const zoomable = computed(() => width.value > 0 && (size.value?.width ?? 0) > width.value)
</script>

<template>
  <Stack
    ref="frame"
    gap="none"
    class="relative aspect-5/6 dark:isolate dark:overflow-hidden dark:rounded-xl dark:bg-neutral-100 dark:brightness-90"
  >
    <Transition
      enter-active-class="transition-opacity duration-(--hn-duration-base) ease-(--hn-ease-enter)"
      leave-active-class="transition-opacity duration-(--hn-duration-exit) ease-(--hn-ease-exit)"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <HikariImage
        :key="imageSourceSrc(image) ?? ''"
        :src="image"
        :alt="alt"
        :nsfw="nsfw"
        :ratio="ratio"
        :processing="{ width: 640, quality: 86, format: 'auto' }"
        :preview="zoomable"
        preload
        class="absolute! inset-x-0 bottom-0 mx-auto mix-blend-multiply"
        :style="{ width: `${Math.min(1, (ratio * 6) / 5) * 100}%` }"
        image-class="object-contain"
      />
    </Transition>
    <slot />
  </Stack>
</template>
