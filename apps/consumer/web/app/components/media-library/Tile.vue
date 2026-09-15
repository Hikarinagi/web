<script setup lang="ts">
  import { Button, Center, Tag } from '@hina-ui/vue'
  import { Check, Trash2 } from '@lucide/vue'
  import { cn } from '~/utils/cn'
  import type { MediaValue } from './types'

  defineProps<{
    media: MediaValue
    selected: boolean
    order?: number
  }>()
  const emit = defineEmits<{ remove: [] }>()

  function onRemoveClick(event: MouseEvent) {
    event.stopPropagation()
    emit('remove')
  }
</script>

<template>
  <Center
    data-media-tile
    :data-media-id="media.id"
    :class="
      cn(
        'group relative aspect-square cursor-pointer overflow-hidden rounded-lg transition-shadow duration-200',
        '[contain-intrinsic-size:auto_7rem_7rem] [content-visibility:auto]',
        selected ? 'ring-2 ring-accent' : 'ring-1 ring-line hover:ring-line-strong',
      )
    "
  >
    <HikariImage
      :src="media.src"
      alt=""
      preset="small"
      class="size-full"
      image-class="size-full object-cover"
    >
      <template #empty />
      <template #error />
    </HikariImage>

    <Center
      aria-hidden="true"
      :class="
        cn(
          'absolute inset-0 transition-colors duration-200',
          selected ? 'bg-accent/10' : 'bg-transparent group-hover:bg-fg/5',
        )
      "
    />

    <Center
      aria-hidden="true"
      :class="
        cn(
          'absolute top-1.5 right-1.5 size-5 rounded-full transition-opacity duration-150',
          selected
            ? 'bg-accent text-accent-on opacity-100'
            : 'bg-neutral-solid text-neutral-solid-on opacity-0 group-hover:opacity-100',
        )
      "
    >
      <Check class="size-3" />
    </Center>

    <Button
      v-if="!selected"
      variant="solid"
      tone="danger"
      size="sm"
      icon-only
      pill
      data-tile-remove
      aria-label="删除"
      class="absolute top-1.5 left-1.5 size-5 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
      @click="onRemoveClick"
    >
      <template #icon><Trash2 class="size-3" /></template>
    </Button>

    <Tag
      v-if="selected && order"
      variant="solid"
      tone="accent"
      pill
      class="absolute bottom-1.5 left-1.5"
    >
      {{ order }}
    </Tag>
  </Center>
</template>
