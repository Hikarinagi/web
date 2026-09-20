<script setup lang="ts">
  const props = defineProps<{
    active?: boolean
    mounted?: boolean
    disabled?: boolean
    hideMobile?: boolean
  }>()
  const emit = defineEmits<{ click: [event: MouseEvent] }>()

  const classes = computed(() =>
    cn(
      'relative z-1 inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-sm font-medium transition-colors',
      'disabled:cursor-not-allowed disabled:opacity-45',
      props.hideMobile && 'hidden sm:inline-flex',
      props.active
        ? props.mounted
          ? 'text-primary-contrast'
          : 'bg-primary text-primary-contrast shadow-sm'
        : 'text-muted-color hover:bg-surface-100 hover:text-color dark:hover:bg-surface-800',
    ),
  )
</script>

<template>
  <Button
    unstyled
    :class="classes"
    :aria-current="active ? 'page' : undefined"
    :disabled="disabled"
    @click="emit('click', $event)"
  >
    <slot />
  </Button>
</template>
