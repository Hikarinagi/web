<script setup lang="ts">
  import { Center, Inline, Stack, Text } from '@hina-ui/vue'
  import { ImageOff } from '@lucide/vue'
  import { RESOURCE_TYPE_LABEL } from '~/features/creator/labels'
  import { cn } from '~/utils/cn'

  const props = withDefaults(
    defineProps<{
      type: string
      id: number | null
      resource: { title: string; cover: string | null } | null
      size?: 'sm' | 'md'
    }>(),
    { size: 'md' },
  )

  const typeLabel = computed(() => RESOURCE_TYPE_LABEL[props.type] ?? props.type)
  const title = computed(
    () => props.resource?.title?.trim() || `${typeLabel.value}${props.id ? ` #${props.id}` : ''}`,
  )
  const coverClass = computed(() => (props.size === 'sm' ? 'h-11 w-8' : 'h-16 w-12'))
  const fallbackClass = computed(() =>
    cn('shrink-0 rounded-md bg-subtle text-muted', coverClass.value),
  )
  const iconClass = computed(() => (props.size === 'sm' ? 'size-3.5' : 'size-4.5'))
</script>

<template>
  <Inline gap="sm" align="center" :wrap="false" class="min-w-0">
    <HikariImage
      :src="resource?.cover"
      :alt="title"
      preset="small"
      :class="['shrink-0 rounded-md', coverClass]"
      image-class="object-cover"
    >
      <template #empty>
        <Center :class="fallbackClass">
          <ImageOff :class="iconClass" aria-hidden="true" />
        </Center>
      </template>

      <template #error>
        <Center :class="fallbackClass">
          <ImageOff :class="iconClass" aria-hidden="true" />
        </Center>
      </template>
    </HikariImage>

    <Stack gap="none" class="min-w-0">
      <Text truncate weight="medium" :size="size === 'sm' ? 'sm' : 'base'">{{ title }}</Text>
      <Text size="xs" tone="muted" truncate>
        {{ typeLabel }}
        <template v-if="id">#{{ id }}</template>
      </Text>
    </Stack>
  </Inline>
</template>
