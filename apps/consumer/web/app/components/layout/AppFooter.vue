<script setup lang="ts">
  import logoUrl from '~/assets/images/logo.png'
  import { SITE_CONFIG } from '~/config/site'

  const year = new Date().getFullYear()
  const { appVersion, buildTime } = useRuntimeConfig().public
  const buildLabel = buildTime ? `Built ${buildTime}` : 'Local build'
</script>

<template>
  <footer class="hidden border-t border-surface bg-surface-50 md:block dark:bg-surface-950">
    <div
      class="mx-auto flex max-w-app flex-col gap-6 px-4 py-9 sm:px-6 md:flex-row md:items-center md:justify-between md:gap-4"
    >
      <div class="flex flex-col gap-2">
        <NuxtLink to="/" :aria-label="SITE_CONFIG.name" class="w-fit">
          <HikariImage
            :src="logoUrl"
            :alt="SITE_CONFIG.name"
            class="aspect-963/183 h-6"
            image-class="object-contain"
            :skeleton="false"
          />
        </NuxtLink>
        <p class="text-sm text-muted-color">{{ SITE_CONFIG.description }}</p>
      </div>

      <div class="flex flex-col gap-4 md:flex-row md:items-center md:gap-5">
        <div class="order-2 flex flex-col gap-1 text-sm text-muted-color md:order-1 md:items-end">
          <p>
            © {{ year }} {{ SITE_CONFIG.name }} · Some Rights Reserved ·
            <span v-tooltip.top="buildLabel" class="cursor-help tabular-nums">{{ appVersion }}</span>
          </p>
          <NuxtLink to="/developers" class="w-fit transition-colors hover:text-color">
            开发者平台
          </NuxtLink>
        </div>
        <LayoutFooterSocial class="order-1 md:order-2" />
      </div>
    </div>
  </footer>
</template>
