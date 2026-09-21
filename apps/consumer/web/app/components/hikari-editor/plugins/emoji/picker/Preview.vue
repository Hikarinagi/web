<script setup lang="ts">
  import { Skeleton, Stack, Text } from '@hina-ui/vue'
  import { EMOJI_PREVIEW_IMAGE } from './image'

  defineOptions({ name: 'HikariEditorPluginsEmojiPickerPreview' })

  const props = defineProps<{
    src: string | null
    name: string
    setName: string | null
  }>()

  const code = computed(() => (props.setName ? `${props.setName}:${props.name}` : props.name))
</script>

<template>
  <Stack gap="xs" align="center">
    <HikariImage
      :src="src"
      :alt="`:${code}:`"
      :processing="EMOJI_PREVIEW_IMAGE"
      :draggable="false"
      class="size-28"
      image-class="size-full object-contain"
    >
      <template #skeleton>
        <Skeleton class="size-full rounded-md" />
      </template>
    </HikariImage>

    <Text as="span" size="xs" tone="muted" class="font-mono">:{{ code }}:</Text>
    <Text v-if="setName" as="span" size="xs" tone="faint">{{ setName }}</Text>
  </Stack>
</template>
