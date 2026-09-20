<script setup lang="ts">
  defineOptions({ name: 'LightNovelSection' })
  defineProps<{
    title: string
    meta?: string
    empty?: boolean
    emptyText?: string
    hideWhenEmpty?: boolean
  }>()
</script>

<template>
  <section v-if="!(empty && hideWhenEmpty)" class="flex flex-col gap-5">
    <div class="flex items-center gap-2.5">
      <h2 class="text-[22px] font-bold text-surface-900 dark:text-surface-0">{{ title }}</h2>
      <p v-if="meta" class="text-[13px] text-surface-500 dark:text-surface-400">{{ meta }}</p>
    </div>

    <slot v-if="!empty" />
    <slot v-else name="empty">
      <div
        class="rounded-xl border border-surface-200 bg-surface-0 px-6 py-5 text-sm text-surface-500 dark:border-surface-800 dark:bg-surface-900 dark:text-surface-400"
      >
        {{ emptyText ?? '还没有内容' }}
      </div>
    </slot>
  </section>
</template>
