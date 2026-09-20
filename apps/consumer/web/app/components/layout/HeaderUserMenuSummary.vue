<script setup lang="ts">
  import type { CurrentUser } from '~/types/auth'

  defineProps<{
    roleLabel: string
    user: CurrentUser
  }>()
</script>

<template>
  <div class="flex items-center gap-3 px-4 py-3">
    <Avatar :user="user" shape="circle" size="large" />
    <div class="min-w-0 flex-1">
      <UserName
        :user="user"
        full
        class="flex text-sm font-semibold text-color"
        handle-class="min-w-0 shrink truncate"
      />
      <div class="truncate text-xs text-muted-color">{{ user.email }}</div>
      <div class="mt-1 text-xs text-primary">{{ roleLabel }}</div>
    </div>
  </div>
</template>
