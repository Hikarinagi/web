<script setup lang="ts">
  import logoUrl from '~/assets/images/wordmark.svg'
  import { SITE_CONFIG } from '~/config/site'

  defineProps<{
    subtitle: string
    title: string
  }>()
</script>

<template>
  <section
    class="mx-auto flex min-h-[calc(100vh-var(--app-header-height))] w-full max-w-md items-center px-4 py-10"
  >
    <div
      class="border-surface-200 bg-surface-0 dark:border-surface-800 dark:bg-surface-900 w-full rounded-lg border p-6 shadow-sm"
    >
      <div class="mb-6 space-y-2">
        <HikariImage
          :src="logoUrl"
          :alt="SITE_CONFIG.name"
          class="aspect-792/191 h-4"
          image-class="object-contain"
          :lazy="false"
          :skeleton="false"
          :preload="{ fetchPriority: 'high' }"
        />
        <h1 class="text-surface-950 dark:text-surface-0 text-2xl font-semibold">
          {{ title }}
        </h1>
        <p class="text-muted-color text-sm">
          {{ subtitle }}
        </p>
      </div>

      <slot />
    </div>
  </section>
</template>
