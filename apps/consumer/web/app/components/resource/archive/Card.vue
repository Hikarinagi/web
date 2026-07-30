<script setup lang="ts">
  import type { VNodeChild } from 'vue'
  import { cn } from '#imports'

  defineOptions({
    name: 'ResourceArchiveCard',
    inheritAttrs: false,
  })

  defineSlots<{
    default?: (props: Record<string, never>) => VNodeChild
    footer?: (props: Record<string, never>) => VNodeChild
  }>()

  const props = withDefaults(
    defineProps<{
      title?: string | null
      footerSeparated?: boolean
    }>(),
    {
      title: '档案',
      footerSeparated: true,
    },
  )

  const attrs = useAttrs()
  const cardClass = computed(() =>
    cn(
      'flex w-full flex-col rounded-xl border border-surface-200 bg-surface-0 lg:w-[280px] lg:shrink-0 dark:border-surface-800 dark:bg-surface-900',
      attrs.class as string | undefined,
    ),
  )
  const cardAttrs = computed(() => {
    const { class: _class, ...rest } = attrs
    return rest
  })
</script>

<template>
  <Card unstyled v-bind="cardAttrs" :class="cardClass">
    <template #content>
      <div class="flex w-full flex-col">
        <h3
          v-if="props.title"
          class="px-5 pt-4 text-[15px] font-bold text-surface-900 dark:text-surface-0"
        >
          {{ props.title }}
        </h3>

        <slot />

        <template v-if="$slots.footer">
          <div
            v-if="props.footerSeparated"
            class="h-px w-full bg-surface-100 dark:bg-surface-800"
          />
          <slot name="footer" />
        </template>
      </div>
    </template>
  </Card>
</template>
