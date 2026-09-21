<script setup lang="ts">
  import { Center, Text } from '@hina-ui/vue'

  defineOptions({ name: 'DeveloperConsoleAppIcon' })

  const props = withDefaults(
    defineProps<{ src: string | null; name: string; size?: 'sm' | 'lg' }>(),
    {
      size: 'sm',
    },
  )

  const initial = computed(() => (props.name.trim().slice(0, 1) || '?').toUpperCase())
</script>

<template>
  <Center
    :class="
      cn(
        'shrink-0 overflow-hidden rounded-full border border-line bg-inset',
        size === 'lg' ? 'size-14' : 'size-10',
      )
    "
  >
    <HikariImage
      v-if="src"
      :src="src"
      :alt="name"
      class="size-full"
      image-class="size-full object-cover"
      :processing="{ q: 85 }"
    />
    <Text v-else as="span" tone="muted" weight="semibold" :size="size === 'lg' ? 'xl' : 'sm'">
      {{ initial }}
    </Text>
  </Center>
</template>
