<script setup lang="ts">
  import { useUserCard } from './composables/useUserCard'

  const controller = useUserCard()
</script>

<template>
  <HoverCardHost :controller="controller">
    <template #default="{ data, loading }">
      <UserCard :user="data" :loading="loading" />
    </template>
  </HoverCardHost>
</template>
