<script setup lang="ts">
  import { Center, Image } from '@hina-ui/vue'
  import type { ClassValue } from 'clsx'
  import makeUpCardUrl from '~/assets/images/make-up-card.webp'

  defineOptions({ name: 'MakeUpCard', inheritAttrs: false })

  withDefaults(defineProps<{ alt?: string }>(), { alt: '' })

  const attrs = useAttrs()
  const rootClass = computed(() =>
    cn('aspect-make-up-card h-5 shrink-0', attrs.class as ClassValue),
  )
  const rootAttrs = computed(() => {
    const { class: _class, ...rest } = attrs
    return rest
  })
</script>

<template>
  <Center inline as="span" v-bind="rootAttrs" :class="rootClass">
    <Image
      :src="makeUpCardUrl"
      :alt="alt"
      fit="contain"
      :lazy="false"
      :skeleton="false"
      :draggable="false"
      class="size-full"
      image-class="select-none"
    />
  </Center>
</template>
