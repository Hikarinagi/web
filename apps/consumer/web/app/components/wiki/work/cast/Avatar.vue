<script setup lang="ts">
  import { AspectRatio, Center, Text } from '@hina-ui/vue'
  import type { ValueDraft } from '~/features/wiki/editor/draft'

  defineOptions({ name: 'WikiWorkCastAvatar' })

  const props = defineProps<{ image: ValueDraft['media']; name: string }>()
  const initial = computed(() => props.name.replace(/\s/g, '').slice(0, 1) || '?')
</script>

<template>
  <AspectRatio :ratio="1" class="w-8 shrink-0 overflow-hidden rounded-full bg-inset">
    <HikariImage
      v-if="image"
      :src="image"
      alt=""
      preset="small"
      class="size-full"
      image-class="size-full object-cover object-top"
    />
    <Center v-else class="size-full">
      <Text as="span" size="xs" tone="muted" lang="ja">{{ initial }}</Text>
    </Center>
  </AspectRatio>
</template>
