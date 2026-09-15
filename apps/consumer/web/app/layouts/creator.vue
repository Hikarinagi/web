<script setup lang="ts">
  import { AppShell, Stack } from '@hina-ui/vue'
  import { useCreatorSidebar } from '~/features/creator/composables/useCreatorSidebar'

  const { state } = useCreatorSidebar()

  const shell = useTemplateRef<InstanceType<typeof AppShell>>('shell')
  const viewport = computed(() => shell.value?.mainViewport ?? null)
</script>

<template>
  <AppShell ref="shell" v-model:sidebar="state" mobile-title="创作者中心" restore-key="creator">
    <template #sidebar><CreatorShellSidebar /></template>
    <template #header><CreatorShellTopbar :viewport="viewport" /></template>

    <Stack class="px-5 py-6">
      <slot />
    </Stack>
  </AppShell>
</template>
