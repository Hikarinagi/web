<script setup lang="ts">
  import { Button, Center } from '@hina-ui/vue'
  import { X } from '@lucide/vue'
  import type { ClassValue } from 'clsx'
  import { cn } from '~/utils/cn'
  import type { MediaValue } from './types'

  defineOptions({ inheritAttrs: false })

  const props = defineProps<{ disabled?: boolean }>()
  const model = defineModel<MediaValue | null>({ default: null })
  const attrs = useAttrs()

  function setOne(picks: MediaValue[]) {
    const [media] = picks
    if (media) model.value = media
  }
  function clear() {
    if (props.disabled) return
    model.value = null
  }
</script>

<template>
  <MediaLibraryAdd
    v-if="!model"
    mode="single"
    :disabled="disabled"
    :class="cn('size-40', attrs.class as ClassValue)"
    @pick="setOne"
  />
  <Center
    v-else
    :class="
      cn(
        'group relative size-40 overflow-hidden rounded-lg border border-line transition-colors',
        disabled && 'opacity-60',
        attrs.class as ClassValue,
      )
    "
  >
    <HikariImage
      :src="model.src"
      alt=""
      preset="small"
      class="size-full"
      image-class="size-full object-cover"
    >
      <template #empty />
      <template #error />
    </HikariImage>
    <Button
      v-if="!disabled"
      variant="solid"
      tone="neutral"
      size="sm"
      icon-only
      pill
      aria-label="移除"
      class="absolute top-1.5 right-1.5 size-6 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
      @click.stop="clear"
    >
      <template #icon><X class="size-3.5" /></template>
    </Button>
  </Center>
</template>
