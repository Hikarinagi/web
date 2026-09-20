<script setup lang="ts">
  import { motion } from 'motion-v'
  import { useCreatorSidebar } from '~/features/creator/composables/useCreatorSidebar'
  import { TRANSITION } from '~/lib/motion'

  const route = useRoute()

  const drawerOpen = ref(false)
  const { collapsed, toggle } = useCreatorSidebar()
  const sidebarMotion = computed(() => ({ width: collapsed.value ? 72 : 256 }))

  watch(
    () => route.fullPath,
    () => {
      drawerOpen.value = false
    },
  )
</script>

<template>
  <div class="flex min-h-screen bg-surface-50 dark:bg-surface-950">
    <motion.aside
      class="sticky top-0 z-30 hidden h-screen shrink-0 self-start overflow-hidden border-r border-surface-200 bg-surface-0 md:block dark:border-surface-800 dark:bg-surface-900"
      :initial="sidebarMotion"
      :animate="sidebarMotion"
      :transition="TRANSITION"
    >
      <div class="h-full">
        <CreatorShellSidebar :collapsed="collapsed" />
      </div>
    </motion.aside>
    <Drawer
      v-model:visible="drawerOpen"
      class="md:hidden!"
      :pt="{ root: { class: 'w-64!' } }"
      :show-close-icon="false"
    >
      <CreatorShellSidebar :collapsed="false" />
    </Drawer>
    <div class="flex min-w-0 flex-1 flex-col">
      <CreatorShellTopbar
        :sidebar-collapsed="collapsed"
        @toggle-nav="drawerOpen = true"
        @toggle-sidebar="toggle"
      />
      <main class="mx-auto w-full flex-1 px-5 py-6">
        <slot />
      </main>
    </div>
  </div>
</template>
