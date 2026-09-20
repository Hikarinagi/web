<script setup lang="ts">
  import { ImageOff } from '@lucide/vue'
  import { RESOURCE_TYPE_LABEL } from '~/features/creator/labels'

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
</script>

<template>
  <div class="flex min-w-0 items-center gap-3">
    <HikariImage
      :src="resource?.cover"
      :alt="title"
      preset="small"
      :class="['shrink-0 rounded-md', coverClass]"
      image-class="object-cover"
    >
      <template #empty>
        <div
          :class="[
            'flex shrink-0 items-center justify-center rounded-md bg-surface-100 text-muted-color dark:bg-surface-800',
            coverClass,
          ]"
        >
          <ImageOff :size="size === 'sm' ? 14 : 18" aria-hidden="true" />
        </div>
      </template>

      <template #error>
        <div
          :class="[
            'flex shrink-0 items-center justify-center rounded-md bg-surface-100 text-muted-color dark:bg-surface-800',
            coverClass,
          ]"
        >
          <ImageOff :size="size === 'sm' ? 14 : 18" aria-hidden="true" />
        </div>
      </template>
    </HikariImage>
    <div class="min-w-0">
      <p :class="['truncate font-medium', size === 'sm' ? 'text-sm' : 'text-base']">
        {{ title }}
      </p>
      <p class="truncate text-xs text-muted-color">
        {{ typeLabel }}
        <template v-if="id">#{{ id }}</template>
      </p>
    </div>
  </div>
</template>
