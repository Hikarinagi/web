<script setup lang="ts">
  import { motion } from 'motion-v'
  import logoUrl from '~/assets/images/creator-center2.webp'
  import { TRANSITION } from '~/lib/motion'

  const props = withDefaults(defineProps<{ collapsed?: boolean }>(), {
    collapsed: false,
  })

  const logoMotion = computed(() => ({
    height: props.collapsed ? 0 : 40,
    marginBottom: props.collapsed ? -8 : 24,
  }))
  const logoContentMotion = computed(() => ({
    opacity: props.collapsed ? 0 : 1,
    x: props.collapsed ? -6 : 0,
  }))
</script>

<template>
  <div class="flex h-full w-full flex-col p-0 md:p-4">
    <motion.div
      class="shrink-0 overflow-hidden"
      :initial="logoMotion"
      :animate="logoMotion"
      :transition="TRANSITION"
      :aria-hidden="collapsed"
    >
      <motion.div
        :initial="logoContentMotion"
        :animate="logoContentMotion"
        :transition="TRANSITION"
      >
        <NuxtLink
          to="/create"
          class="flex items-center px-2 pt-2"
          aria-label="创作者中心"
          :tabindex="collapsed ? -1 : undefined"
        >
          <HikariImage
            :src="logoUrl"
            alt="Hikarinagi 创作者中心"
            class="h-8"
            image-class="object-contain"
            :lazy="false"
            :skeleton="false"
            :preload="{ fetchPriority: 'high' }"
          />
        </NuxtLink>
      </motion.div>
    </motion.div>
    <CreatorShellSidebarNav :collapsed="collapsed" class="min-h-0 flex-1 overflow-y-auto" />
    <CreatorShellSidebarUser :collapsed="collapsed" class="mt-6" />
  </div>
</template>
