<script setup lang="ts">
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
  <div
    class="shrink-0 overflow-hidden rounded-full border border-surface bg-surface-100 dark:bg-surface-800"
    :class="size === 'lg' ? 'size-14' : 'size-10'"
  >
    <HikariImage
      v-if="src"
      :src="src"
      :alt="name"
      class="size-full"
      image-class="size-full object-cover"
      :processing="{ q: 85 }"
    />
    <span
      v-else
      class="flex size-full items-center justify-center font-semibold text-muted-color"
      :class="size === 'lg' ? 'text-xl' : 'text-sm'"
    >
      {{ initial }}
    </span>
  </div>
</template>
