<script setup lang="ts">
  import logoUrl from '~/assets/images/logo.png'
  import { SITE_CONFIG } from '~/config/site'

  defineProps<{
    subtitle: string
    title: string
  }>()
</script>

<template>
  <section class="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center px-4 py-10">
    <div
      class="w-full rounded-lg border border-surface-200 bg-surface-0 p-6 shadow-sm dark:border-surface-800 dark:bg-surface-900"
    >
      <div class="mb-6 space-y-2">
        <HikariImage
          :src="logoUrl"
          :alt="SITE_CONFIG.name"
          class="aspect-963/183 h-4"
          image-class="object-contain"
          :lazy="false"
          :skeleton="false"
          :preload="{ fetchPriority: 'high' }"
        />
        <h1 class="text-2xl font-semibold text-surface-950 dark:text-surface-0">
          {{ title }}
        </h1>
        <p class="text-sm text-muted-color">
          {{ subtitle }}
        </p>
      </div>

      <slot />
    </div>
  </section>
</template>
