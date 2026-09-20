<script setup lang="ts">
  const props = defineProps<{
    op: Record<string, unknown>
  }>()

  const diff = computed(() => {
    const a = Array.isArray(props.op.from) ? props.op.from.map(String) : []
    const b = Array.isArray(props.op.to) ? props.op.to.map(String) : []
    return {
      kept: a.filter(item => b.includes(item)),
      removed: a.filter(item => !b.includes(item)),
      added: b.filter(item => !a.includes(item)),
    }
  })
</script>

<template>
  <ul class="flex flex-col gap-1">
    <li v-for="item in diff.removed" :key="`r-${item}`" class="text-red-700 dark:text-red-300">
      <span class="select-none">−</span>
      <span class="line-through">{{ item }}</span>
    </li>
    <li v-for="item in diff.added" :key="`a-${item}`" class="text-green-700 dark:text-green-300">
      <span class="select-none">+</span>
      {{ item }}
    </li>
    <li v-for="item in diff.kept" :key="`k-${item}`" class="text-muted-color">
      <span class="select-none">·</span>
      {{ item }}
    </li>
  </ul>
</template>
