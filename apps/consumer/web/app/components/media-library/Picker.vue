<script setup lang="ts">
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
  <div
    v-else
    :class="
      cn(
        'group relative size-40 overflow-hidden rounded-lg border border-surface-200 transition-colors dark:border-surface-700',
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
      <template #empty><span /></template>
      <template #error><span /></template>
    </HikariImage>
    <div class="absolute top-1.5 right-1.5">
      <Button
        v-if="!disabled"
        unstyled
        class="flex size-6 items-center justify-center rounded-full bg-surface-900/60 text-white opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
        @click.stop="clear"
      >
        <template #icon>
          <X :size="14" />
        </template>
      </Button>
    </div>
  </div>
</template>
