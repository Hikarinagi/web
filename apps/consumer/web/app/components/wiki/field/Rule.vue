<script setup lang="ts">
  defineOptions({ name: 'WikiFieldRule' })

  defineProps<{ label: string; clauses: string[] }>()
</script>

<template>
  <Question :title="label" :aria-label="`查看${label}的编辑规范`" size="md">
    <WikiFieldClauses :clauses="clauses" />
  </Question>
</template>
