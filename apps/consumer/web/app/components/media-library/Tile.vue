<script setup lang="ts">
  import { Check, Trash2 } from '@lucide/vue'
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
  <div
    data-media-tile
    :data-media-id="media.id"
    :class="[
      'group relative aspect-square cursor-pointer overflow-hidden rounded-lg transition-shadow duration-200 [contain-intrinsic-size:auto_7rem_7rem] [content-visibility:auto]',
      selected
        ? 'ring-2 ring-primary'
        : 'ring-1 ring-surface-200 hover:ring-surface-400 dark:ring-surface-700',
    ]"
  >
    <HikariImage
      :src="media.src"
      alt=""
      preset="small"
      class="size-full"
      image-class="size-full object-cover"
    >
      <template #empty><span /></template>
      <template #error><span /></template>
    </HikariImage>

    <div
      :class="[
        'absolute inset-0 transition-colors duration-200',
        selected
          ? 'bg-primary/10'
          : 'bg-transparent group-hover:bg-surface-950/5 dark:group-hover:bg-surface-0/5',
      ]"
    />

    <span
      :class="[
        'absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full text-white transition-opacity duration-150',
        selected ? 'bg-primary opacity-100' : 'bg-surface-900/55 opacity-0 group-hover:opacity-100',
      ]"
    >
      <Check class="size-3" />
    </span>

    <div class="absolute top-1.5 left-1.5">
      <Button
        v-if="!selected"
        unstyled
        type="button"
        class="flex size-5 items-center justify-center rounded-full bg-surface-900/55 text-white opacity-100 transition-all duration-150 hover:bg-red-500 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
        aria-label="删除"
        @click="onRemoveClick"
      >
        <Trash2 class="size-3" />
      </Button>
    </div>

    <span
      v-if="selected && order"
      class="absolute bottom-1.5 left-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-white"
    >
      {{ order }}
    </span>
  </div>
</template>
