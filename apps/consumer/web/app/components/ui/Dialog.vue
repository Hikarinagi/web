<script setup lang="ts">
  import type { ClassValue } from 'clsx'
  import PrimeDialog from 'primevue/dialog'
  import { cn } from '~/utils/cn'

  defineOptions({
    name: 'HikariDialog',
    inheritAttrs: false,
  })

  const props = withDefaults(defineProps<{ scroll?: boolean; contentClass?: ClassValue }>(), {
    scroll: true,
    contentClass: undefined,
  })

  const visible = defineModel<boolean>('visible', { default: false })
  const attrs = useAttrs()

  const scrollClass = computed(() => cn('max-h-[70vh]', props.contentClass))
</script>

<template>
  <PrimeDialog v-model:visible="visible" v-bind="attrs">
    <template v-if="$slots.container" #container="slotProps">
      <slot name="container" v-bind="slotProps" />
    </template>
    <template v-if="$slots.header" #header>
      <slot name="header" />
    </template>
    <template v-if="$slots.closeicon" #closeicon="slotProps">
      <slot name="closeicon" v-bind="slotProps" />
    </template>
    <template v-if="$slots.maximizeicon" #maximizeicon="slotProps">
      <slot name="maximizeicon" v-bind="slotProps" />
    </template>
    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>

    <ScrollArea v-if="scroll" :class="scrollClass">
      <slot />
    </ScrollArea>
    <slot v-else />
  </PrimeDialog>
</template>
