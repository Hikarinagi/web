<script setup lang="ts">
  import { Inline, Stack, Text } from '@hina-ui/vue'
  import type { CurrentUser } from '~/types/auth'

  defineProps<{
    roleLabel: string
    user: CurrentUser
  }>()
</script>

<template>
  <Inline gap="sm" align="center" :wrap="false" class="gap-3 px-4 py-3">
    <Avatar :user="user" size="lg" class="size-12" />
    <Stack gap="none" class="min-w-0 flex-1">
      <UserName
        :user="user"
        full
        class="flex text-sm font-semibold"
        handle-class="min-w-0 shrink truncate"
      />
      <Text as="p" size="xs" tone="muted" truncate>{{ user.email }}</Text>
      <Text as="p" size="xs" tone="accent" class="mt-1">{{ roleLabel }}</Text>
    </Stack>
  </Inline>
</template>
