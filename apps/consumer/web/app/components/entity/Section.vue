<script setup lang="ts">
  defineOptions({ name: 'EntitySection' })
  defineProps<{
    title: string
    meta?: string | null
    moreTo?: string | null
    moreText?: string
  }>()
</script>

<template>
  <section class="flex flex-col gap-5">
    <div class="flex items-center justify-between gap-4">
      <div class="flex items-center gap-2.5">
        <h2 class="text-[22px] font-bold text-surface-900 dark:text-surface-0">{{ title }}</h2>
        <p v-if="meta" class="text-[13px] text-surface-500 dark:text-surface-400">{{ meta }}</p>
      </div>
      <ViewAllLink v-if="moreTo" :to="moreTo">
        {{ moreText ?? '查看全部' }}
      </ViewAllLink>
    </div>
    <slot />
  </section>
</template>
