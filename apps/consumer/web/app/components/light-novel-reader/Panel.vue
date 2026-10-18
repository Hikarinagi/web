<script setup lang="ts">
  import { CloseButton, Heading, Inline, ScrollArea, Stack } from '@hina-ui/vue'

  defineOptions({ name: 'LightNovelReaderPanel' })

  defineProps<{ title: string }>()
  const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <Stack gap="none" class="min-h-0 flex-1">
    <Inline
      justify="between"
      align="center"
      :wrap="false"
      class="h-10 shrink-0 border-b border-line ps-4 pe-2"
    >
      <Heading :level="2" size="sm">{{ title }}</Heading>
      <CloseButton :label="`关闭${title}`" @click="emit('close')" />
    </Inline>
    <ScrollArea class="min-h-0 flex-1">
      <Stack gap="none" class="p-4"><slot /></Stack>
    </ScrollArea>
    <Inline
      v-if="$slots.footer"
      :wrap="false"
      class="min-h-17 shrink-0 border-t border-line px-4 py-3"
    >
      <slot name="footer" />
    </Inline>
  </Stack>
</template>
