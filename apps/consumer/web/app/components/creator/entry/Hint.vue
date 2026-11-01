<script setup lang="ts">
  import { HINTS } from '~/features/creator/entry/hints'

  defineOptions({ name: 'CreatorEntryHint' })
  const props = defineProps<{ name: string }>()
  const hint = computed(() => HINTS[props.name])
</script>

<template>
  <Question v-if="hint" :title="hint.title" :aria-label="`查看${hint.title}的说明`">
    {{ hint.text }}
  </Question>
</template>
