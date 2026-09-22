<script setup lang="ts">
  import { Image } from '@hina-ui/vue'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'UiBrandMark', inheritAttrs: false })

  const props = withDefaults(defineProps<{ mark?: 'wordmark' | 'id'; inline?: boolean }>(), {
    mark: 'wordmark',
    inline: false,
  })

  const attrs = useAttrs()

  const MARKS = {
    wordmark: { src: '/brand/hikarinagi-wordmark.svg', alt: 'Hikarinagi' },
    id: { src: '/brand/hikarinagi-id-lockup.svg', alt: 'Hikarinagi ID' },
  } as const

  const source = computed(() => MARKS[props.mark])
</script>

<template>
  <Image
    :src="source.src"
    :alt="source.alt"
    eager
    :lazy="false"
    :skeleton="false"
    :draggable="false"
    fit="contain"
    :class="
      cn('select-none', inline && 'inline-block hikari-brand-inline w-auto', attrs.class as string)
    "
  />
</template>
