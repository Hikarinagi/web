<script setup lang="ts">
  import { useWorkCard } from './composables/useWorkCard'

  const controller = useWorkCard()
</script>

<template>
  <HoverCardHost :controller="controller">
    <template #default="{ data, loading }">
      <WorkCard :work="data" :loading="loading" />
    </template>
  </HoverCardHost>
</template>
