<script setup lang="ts">
  import { Center, Image, Stack } from '@hina-ui/vue'
  import type { ClassValue } from 'clsx'
  import hikariPointUrl from '~/assets/images/hikari-point.webp'

  defineOptions({ name: 'HikariPoint', inheritAttrs: false })

  withDefaults(
    defineProps<{
      alt?: string
      whiteBackground?: boolean
    }>(),
    {
      alt: '',
      whiteBackground: true,
    },
  )

  const attrs = useAttrs()
  const rootClass = computed(() =>
    cn('relative size-5 shrink-0 align-[-0.125em]', attrs.class as ClassValue),
  )
  const rootAttrs = computed(() => {
    const { class: _class, ...rest } = attrs
    return rest
  })
</script>

<template>
  <Center inline as="span" v-bind="rootAttrs" :class="rootClass">
    <Stack
      v-if="whiteBackground"
      gap="none"
      class="pointer-events-none absolute inset-[8%] bg-white [clip-path:polygon(50%_0%,93%_25%,93%_75%,50%_100%,7%_75%,7%_25%)]"
      aria-hidden="true"
    />
    <Image
      :src="hikariPointUrl"
      :alt="alt"
      fit="contain"
      :lazy="false"
      :skeleton="false"
      :draggable="false"
      class="relative size-full"
      image-class="select-none"
    />
  </Center>
</template>
